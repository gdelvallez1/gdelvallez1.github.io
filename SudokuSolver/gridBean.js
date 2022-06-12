// gridBean.js

const cols = ["A", "B", "C", "D", "E", "F", "G","H","I"];

function gridBean() {
	this.initializeGrid();
}

gridBean.prototype.initializeGrid = function() {
	this.cells={};
	this.groups={};
	let previousCell;
	
	for (let x = 0; x <= 8; x++) {
		let col=cols[x];
		for (let y = 1; y<=9; y++) {
			let id=col+'_'+y;
			let ligne="L"+y;
			let colonne="C"+col;
			let q= 1+parseInt(x/3) + parseInt((y-1)/3)*3;
			let quartier="Q"+q;
			let cell={};
			cell.id = id;
			cell.validHypothesis=[];
			cell.value="";
			cell.ligne=ligne;
			cell.colonne=colonne;
			cell.quartier=quartier;
			cell.nextCellId="";
			this.cells[id]=cell;
			// add to groups : ligne
			if (this.groups[ligne] == undefined) {
				this.groups[ligne]=[];
			}
			this.groups[ligne].push(id);
			// add to groups : colonne
			if (this.groups[colonne] == undefined) {
				this.groups[colonne]=[];
			}
			this.groups[colonne].push(id);
			// add to groups : quartier
			if (this.groups[quartier] == undefined) {
				this.groups[quartier]=[];
			}
			this.groups[quartier].push(id);
			// set nextCellId of the previousCell with the current ID
			if ( previousCell !== undefined){
				previousCell.nextCellId=id;
			}
			previousCell = cell;
		} // end for y
	} // end for x

	// reset hypotesis
	this.resethypothesis();
	
	// initialize errors
	this.resetErrors();
};

gridBean.prototype.resethypothesis = function() {
	for (let x = 0; x <= 8; x++) {
		let col=cols[x];
		for (let y = 1; y<=9; y++) {
			let id=col+'_'+y;
			cell = this.cells[id];
			cell.validHypothesis=["",1,2,3,4,5,6,7,8,9];
		}
	}
};

gridBean.prototype.resetErrors = function() {
	this.status="";
	this.errorList=[];
	this.warningList=[];
};

gridBean.prototype.getCell=function(_id) {
	let cell = this.cells[_id];
	return cell;
};

gridBean.prototype.getCells=function() {
	return this.cells;
};

gridBean.prototype.getErrorList=function() {
	return this.errorList;
};

gridBean.prototype.getWarningList=function() {
	return this.warningList;
};

gridBean.prototype.getStatus=function() {
	return this.status;
};

gridBean.prototype.getGroup=function(_groupid) {
	let group = this.groups[_groupid];
	return group;
};

// manage counter
gridBean.prototype.setHypothesis=function(_cellBean,_hypoVal) {
	if (_cellBean == undefined) {
		return;
	}
	if (_hypoVal == undefined) {
		return;
	}
	
	// check hypothesis is valid
	if (_cellBean.validHypothesis[_hypoVal] == _hypoVal) {	
		// update value
		_cellBean.value=_hypoVal;

		// update hypothesis
		_cellBean.validHypothesis[_hypoVal]="";
	
		// get list of cell to update
		let id=_cellBean.id;
		let ligneid=_cellBean.ligne;
		let colonneid=_cellBean.colonne;
		let quartierid=_cellBean.quartier;
		// get list of ids
		let ligne=this.groups[ligneid];
		let colonne=this.groups[colonneid];
		let quartier=this.groups[quartierid];	
	
		// update cells hypothesis
		let cellId;
		let cell;
		let i;	
		for (i in ligne) {
			cellId=ligne[i];
			// do not update current cell
			if (cellId !== id) {
				cell = this.cells[cellId];
				cell.validHypothesis[_hypoVal]="";
			}
		}
		for (i in colonne) {
			cellId=colonne[i];
			if (cellId !== id) {
				cell = this.cells[cellId];
				cell.validHypothesis[_hypoVal]="";
			}
		}
		for (i in quartier) {
			cellId=quartier[i];
			if (cellId !== id) {
				cell = this.cells[cellId];
				cell.validHypothesis[_hypoVal]="";
			}
		}
	}
};

gridBean.prototype.resetValue=function(_cellBean) {
	// reset value
	_cellBean.value="";
	//reset hypothesis
	this.resethypothesis();
	// recalculate hypothesis
	for (cellId in this.cells) {
		cell = this.cells[cellId];
		let value = cell.value;
		if (value !== "") {
			this.setHypothesis(cell,value);
		}
	}
};

// check for errors
// no return
gridBean.prototype.checkErrors=function() {
	// reset errors
	this.resetErrors();

	// Loop to all lines to look for errors 
	let group;
	let groupId;
	let cellId;
	let noErrors = true;
	let allValuesSet = true;
	for (groupId in this.groups) {
		group=this.groups[groupId];
		let errorFound = this.checkGroup(group,groupId);
		if (errorFound) {
			noErrors = false;
		}
	}
	
	// if no errors
	if (noErrors) {
		// check if all cells get a value
		for (cellId in this.cells) {
			cell=this.cells[cellId];
			if (cell.value == "") {
				allValuesSet=false;
				break;
			}
		}
		// if all values set
		if (allValuesSet) {
			this.status="WIN";
		}
	}
};

// add error to error list
gridBean.prototype.addError=function(_location,_message) {
	// check if message already exixts
	let foundObj = this.errorList.find(
            value => { return (value.where+value.message == _location+_message) } );
	if (foundObj == undefined) {
		let errorObj ={};
		// set error object
		errorObj.where=_location;
		errorObj.message=_message;
		// set type error
		errorObj.type="E";
		// add error to list
		this.errorList.push(errorObj);
	}
}

// add error to error list
gridBean.prototype.addWarning=function(_location,_message) {
	// check if message already exixts
	let foundObj = this.warningList.find(
            value => { return (value.where+value.message == _location+_message) } );
	if (foundObj == undefined) {
		let warnObj ={};
		// set error object= 
		warnObj.where=_location;
		warnObj.message=_message;
		// set type error
		warnObj.type="W";
		// add error to list
		this.warningList.push(warnObj);
	}
}

// check for errors in one line
// return true if an error is found or false other hise
gridBean.prototype.checkGroup=function(_group,_groupId) {
	let oneErrorFound = false;
	let groupIndex;
	let cellId;
	let cell;
	let nbHypothesis=["",0,0,0,0,0,0,0,0,0];
	let cellHypothesis=["","","","","","","","","",""];
	let valueSet=["",0,0,0,0,0,0,0,0,0];
	// Loop on cells of that line
	for (groupIndex in _group) {
		cellId=_group[groupIndex];
		cell=this.cells[cellId];
		// register the value as ok
		let value= cell.value;
		if (value !== "") {
			// there is a value set
			if (valueSet[value]!== 0) {
				// value seen the second time in the line
				let msg="Same value twice:"+value;
				this.addError(_groupId,msg);
				this.status="FAILED";
				oneErrorFound = true;
			} else {
				// register the value
				nbHypothesis[value]+=1;
				valueSet[value]+=1;
			}
		} else {
			// register the possible values
			let validHypothesis = cell.validHypothesis;
			let nbHypo=0;
			for (let i in validHypothesis) {
				if (i !== "0") {
					hypo = validHypothesis[i];
					if (hypo !== "") {
						nbHypo = nbHypo + 1;
						nbHypothesis[hypo]+=1;
						cellHypothesis[hypo]=cellId;
					}
				}
			}
			// if no hypo on this cell
			if (nbHypo == 0) {
				// no solution possible and no value assigned
				let msg="No possible values for cell "+cellId;
				this.addError(cellId,msg);
				this.status="FAILED";
				oneErrorFound = true;
			} else if (nbHypo == 1) {
				//Only One possible value for cell and no value assigbned
				let msg="Only one possible values for cell "+cellId;
				this.addWarning(cellId,msg);
			}
		}
	}
	// check all numbers can be possible or assigned
	for (let i in nbHypothesis) {
		// if i is valid and that value is not set
		if (i !== "0" && valueSet[i] == 0) {
			hypo = nbHypothesis[i];
			if ( hypo ==0 ) {
				let msg="Not possible to set "+i+" somewhere";
				this.addError(_groupId,msg);
				this.status="FAILED";
				oneErrorFound = true;
			} else if ( hypo == 1 ) {
				let cellHypo = cellHypothesis[i];
				let msg="This is the only possible cell to set "+i;
				this.addWarning(cellHypo,msg);
			}
		}
	}
	return oneErrorFound;
};

gridBean.prototype.toString=function() {
	let cellId;
	let cell;
	let counterStr="";
	for (let y = 1; y<=9; y++) {
		for (let x = 0; x <= 8; x++) {
			let col=cols[x];
			let id=col+'_'+y;
			cell = this.cells[id];
			if (cell.value) {
				counterStr += cell.value;
			} else {
				counterStr += "_";
			}
			if (x == 2 || x == 5){
				counterStr += " ";
			}
		}
		if (y<9) {
			counterStr += ", ";
		}
	}
	return counterStr;
};

gridBean.prototype.readString=function(_gridString) {
	// reset Grid
	this.initializeGrid();
	
	let row = 1;
	let col = 0;
	// read grid description
	let rows = _gridString.split(",");
	// for each counter
	for (let rowIndex in rows) {
		let rowString = rows[rowIndex];
		for (let cellIndex in rowString) {
			let cellString = rowString[cellIndex];
			// ignore space
			if ( cellString !== " " ) {
				// ignore _
				if (cellString !== "_") {
					// get id
					let colLetter=cols[col];
					let id=colLetter+'_'+row;
					// get cell
					let cellBean = this.cells[id];
					// manageCounter()
					this.setHypothesis(cellBean,cellString);
				}
				// prepare for next loop
				col++;
			}
		}
		// prepare for next loop
		row++;
		col=0;
	}
};

gridBean.prototype.getNextCell=function(_cell) {
	let nextCell = undefined;
	// get next id
	let nextId = _cell.nextCellId;
	if (nextId != "") {
		nextCell = this.cells[nextId];
	}
	
	// return 
	return nextCell;
};

