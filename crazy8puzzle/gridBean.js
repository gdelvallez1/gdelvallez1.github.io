// gridBean.js


function gridBean() {
	this.initializeGrid();
}

gridBean.getGrid = function() {
	var grid_= undefined;
	if(typeof(Storage) !== "undefined") {
		// Code for localStorage/sessionStorage.
		var gridStr=sessionStorage.getItem("grid");
		if (gridStr !== undefined) {
			grid_=new gridBean();
			grid_.deserialize(gridStr);
		}
	}
	return grid_;
};

gridBean.storeGrid = function(grid_) {
	var gridStr;
	if(typeof(Storage) !== "undefined") {
    	// Code for localStorage/sessionStorage.
    	gridStr=grid_.serialize();
    	sessionStorage.setItem("grid", gridStr);
	}
};

gridBean.prototype.initializeGrid = function() {
	this.cells={};
	this.errors={};
	this.lines={};
	this.nbCounter=0;
	this.status="";
	for (var x = 1; x <= 8; x++) {
		for (var y = 1; y<=8; y++) {
			var id=x+'_'+y;
			var h=y;
			var v=x;
			var dm=x+y-1;
			var dd=x-y+8;
			var cell={};
			cell.id = id;
			cell.h = h;
			cell.v = v;
			cell.dm = dm;
			cell.dd = dd;
			cell.counter = false;
			cell.usedCount = 0;
			this.cells[id]=cell;
			// add to lines
			if (this.lines["h"+cell.h] == undefined) {
				this.lines["h"+cell.h]=[];
			}
			this.lines["h"+cell.h].push(id);
			if (this.lines["v"+cell.v] == undefined) {
			this.lines["v"+cell.v]=[];
			}
			this.lines["v"+cell.v].push(id);
			if (this.lines["dd"+cell.dd] == undefined) {
				this.lines["dd"+cell.dd]=[];
			}
			this.lines["dd"+cell.dd].push(id);
			if (this.lines["dm"+cell.dm] == undefined) {
				this.lines["dm"+cell.dm]=[];
			}
			this.lines["dm"+cell.dm].push(id);
		} // end for y
	} // end for x

	// initialize errors
	this.resetErrors();
};

gridBean.prototype.resetErrors = function() {
	this.errors={};
	this.status="";
	for (var x = 1; x <= 8; x++) {
		for (var y = 1; y<=8; y++) {
			var h=x;
			var v=y;
			var dm=x+y-1;
			var dd=x-y+8;
			this.errors["h"+h]="";
			this.errors["v"+v]="";
			this.errors["dm"+dm]="";
			this.errors["dd"+dd]="";
		}
	}
};

gridBean.prototype.getCell=function(id) {
	var cell = this.cells[id];
	return cell;
};

gridBean.prototype.getCellXY=function(x,y) {
	var id=x+'_'+y;
	var cell = this.getCell(id);
	return cell;
};

gridBean.prototype.getCells=function() {
	return this.cells;
};

gridBean.prototype.getErrors=function() {
	return this.errors;
};

gridBean.prototype.getStatus=function() {
	return this.status;
};

gridBean.prototype.getNbCounter=function() {
	return this.nbCounter;
};

// manage counter
gridBean.prototype.manageCounter=function(cellBean) {
	if (cellBean == undefined) {
		return;
	}
	
	var inc = 1;
	if (cellBean.counter) {
		// if you have a counter, so we remove it
		inc = -1;
	}
	
	// update counter
	cellBean.counter = !cellBean.counter;
	
	// update grid nb of counter
	this.nbCounter += inc;

	// get list of cell to update
	var id=cellBean.id;
	var h=cellBean.h;
	var v=cellBean.v;
	var dm=cellBean.dm;
	var dd=cellBean.dd;
	// get list of ids
	var hList=this.lines["h"+h];
	var vList=this.lines["v"+v];
	var dmList=this.lines["dm"+dm];
	var ddList=this.lines["dd"+dd];
	
	// update cells from the lines (but not the current one)
	var cellId;
	var cell;
	var i;	
	for (i in hList) {
		cellId=hList[i];
		// do not update current cell
		if (cellId !== id) {
			cell = this.cells[cellId];
			cell.usedCount += inc;
		}
	}
	for (i in vList) {
		cellId=vList[i];
		if (cellId !== id) {
			cell = this.cells[cellId];
			cell.usedCount += inc;
		}
	}
	for (i in dmList) {
		cellId=dmList[i];
		if (cellId !== id) {
			cell = this.cells[cellId];
			cell.usedCount += inc;
		}
	}
	for (i in ddList) {
		cellId=ddList[i];
		if (cellId !== id) {
			cell = this.cells[cellId];
			cell.usedCount += inc;
		}
	}
} ;

// check for errors
gridBean.prototype.checkErrors=function() {
	// reset errors
	this.resetErrors();

	// Loop to all lines to look for errors 
	var line;
	var lineId;
	for (lineId in this.lines) {
		line=this.lines[lineId];
		var isHorVLine = lineId.indexOf("h")===0 || lineId.indexOf("v")===0;
		var error = this.checkLine(line, isHorVLine);
		this.errors[lineId] = error ;
	}
	//if 8 counter with no errors => WIN
	if (this.status==="" && this.nbCounter === 8) {
		this.status="WIN";
	}
};

// check for errors in one line
gridBean.prototype.checkLine=function(line,isHV) {

	// Loop on cells of that line
	var lineId;
	var cellId;
	var cell;
	var nbCounter=0;
	var nbFreeCell=0;
	var error = "";
	for (lineId in line) {
		cellId = line[lineId];
		cell=this.cells[cellId];
		if (cell.counter) {
			nbCounter +=1;
		}
		if (cell.usedCount===0) {
			nbFreeCell +=1;
		}
	}
	// Error ERR01 : More than one counter in this line
	if (nbCounter>1){
		error = "More than one counter on this line.";
		this.status="FAILED";
	}
	// Error ERR02 : No counter and no free cell (H or V line only)
	if ( isHV && nbCounter === 0 && nbFreeCell === 0) {
		error = "No free space for a counter on this line";
		this.status="FAILED";
	}
	return error;
};

gridBean.prototype.serialize=function() {
	var cellId;
	var cell;
	var counterStr='';
	var counters=[];
	// get list of ids
	for (cellId in this.cells) {
		cell = this.cells[cellId];
		if (cell.counter) {
			counters.push(cellId);
		}
	}
	counterStr = JSON.stringify(counters);
	return counterStr;
};

gridBean.prototype.deserialize=function(counterStr) {
	// read the string
	var counters = JSON.parse(counterStr);
	// initialize the grid
	this.initializeGrid();
	// set the counters
	for (var i in counters) {
		// get id, get cell
		var id=counters[i];
		var cellBean = this.cells[id];
		// manageCounter()
		this.manageCounter(cellBean);
	}

	// check for errors
	this.checkErrors();
};

gridBean.prototype.toString=function() {
	var cellId;
	var cell;
	var counterStr='';
	// get list of ids
/* 	for (cellId in this.cells) {
		cell = this.cells[cellId];
		if (cell.counter) {
			counterStr += "("+cell.h+","+cell.v+") ";
		}
	} */
	for (var y = 1; y <= 8; y++) {
		for (var x = 1; x<=8; x++) {
			var cellId=x+'_'+y;
			cell = this.cells[cellId];
			if (cell.counter) {
			counterStr += "("+cell.h+","+cell.v+") ";
			}
		}
	}

	return counterStr;
};

gridBean.prototype.readString=function(gridString) {
	// reset Grid
	this.initializeGrid();
	
	// read grid description
	var counterList = gridString.split(" ");
	// for each counter
	for (var i in counterList) {
		// get id, get cell
		var id=counterList[i].replace("(", "").replace(")", "").replace(",", "_");
		var cellBean = this.cells[id];
		// manageCounter()
		this.manageCounter(cellBean);
	}
	
	// check for errors
	this.checkErrors();

};