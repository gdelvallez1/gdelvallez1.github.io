// SudokuSolver.js

var grid = undefined;
var solutionsList = undefined;
var myWorker = undefined;

grid = new gridBean();
solutionsList = new solutions();

display(grid);

function resetGrid() {
	grid = new gridBean();
	grid.checkErrors();
	solutionsList = new solutions();
	display(grid);
	resetSolutionList();
}

function resetSolutionList() {
	// get elements in DOM
	let ulTag = document.getElementById("solutionList");
	let parentTag = ulTag.parentElement;
	// remove all UL tag
	parentTag.removeChild(ulTag);
	// create new UL tag
	let ulTagNew = document.createElement("ul");
	ulTagNew.setAttribute("id","solutionList");
	parentTag.appendChild(ulTagNew);
	// create initial LI tag
	let liTag = document.createElement("li");
	liTag.innerHTML = "solutions to be provided when you click on above button";
	ulTagNew.appendChild(liTag);
}

// manage click on hypothesis
function setHypothesis(_cellTag) {
	let hypoId = _cellTag.id;
	let cellId = hypoId.substr(0, 3);
	let hypoVal = parseInt(hypoId.substr(4, 1));
	let cellBean = grid.getCell(cellId);
	// update the grid
	grid.setHypothesis(cellBean,hypoVal);
	// check for errors
	grid.checkErrors();
	// display grid
	display(grid);
}

// manage click on value
function resetValue(_cellTag) {
	let cellId = _cellTag.id.substr(4, 3);
	let cellBean = grid.getCell(cellId);
	// update the grid
	grid.resetValue(cellBean);
	// check for errors
	grid.checkErrors();
	// display grid
	display(grid);
}

// set info into cell
function display(_grid) {
	for (let cellId in _grid.getCells()) {
		let cell = _grid.getCell(cellId);
		let value = cell.value;
		let cellTag = document.getElementById("Cell_"+cellId);
		let valueTag = document.getElementById("Val_"+cellId);
		let hypoTag = document.getElementById("Hypo_"+cellId);
		if (value !== "") {
			// display value
			valueTag.innerHTML=value;
			valueTag.setAttribute("class","value show");
			hypoTag.setAttribute("class","hypo hide");
		} else {
			// display valid hypothesis
			valueTag.setAttribute("class","value hide");
			hypoTag.setAttribute("class","hypo show");
			let validHypo = cell.validHypothesis;
			for (let i in validHypo) {
				// index i = 0 is not a valid index
				if (i !== "0") {
					// get hypothesis value
					let hypoVal=validHypo[i];
					let hypoId = cellId+"_"+i;
					oneHypoTag = document.getElementById(hypoId);
					oneHypoTag.innerHTML=hypoVal;
					oneHypoTag.className="hypo";
					// remove listener by cloning
					let oneHypoTagClone = oneHypoTag.cloneNode(true);
					// set event for valid hypothesis only
					if (hypoVal != "") {
						oneHypoTagClone.addEventListener("click", function(){ setHypothesis(this); });
					}
					// replace the hypotag by clone
					oneHypoTag.parentElement.replaceChild(oneHypoTagClone, oneHypoTag);
				}
			}
		}
		// reset cell border
		cellTag.style="";
	}
	
	// clear errors
	let errorTag = document.getElementById("errorList");
	while(errorTag.lastElementChild !== null) {
		errorTag.removeChild(errorTag.lastElementChild);
	}
	// display status
	let status=_grid.getStatus();
	document.getElementById("status").innerHTML=status;
	if (status !== "") {
		let texte = status;
		let liTag = document.createElement("li");
		liTag.innerHTML=texte;
		liTag.className="status";
		errorTag.appendChild(liTag);		
	}
	// display error list
	let errorArray = _grid.getErrorList();
	for (let errorIndex in errorArray ) {
		let errorObj = errorArray[errorIndex];
		let errorLoc = errorObj.where;
		let errorValue = errorObj.hypo;
		let errorMsg = errorObj.message;
		let texte = errorLoc+" "+errorValue+" : "+errorMsg;
		let liTag = document.createElement("li");
		liTag.innerHTML=texte;
		liTag.setAttribute("class","error");
		errorTag.appendChild(liTag);
		// set color to border
		if (errorLoc.indexOf("_") != -1) {
			// location is a cell
			let cellTag = document.getElementById("Cell_"+errorLoc);
			cellTag.style="border-color:red";
		} else {
			// location is a group
			colorGroupBorder(errorLoc);
		}
	}
	// display warning list
	let warnArray = _grid.getWarningList();
	for (let warnIndex in warnArray ) {
		// add info in list of warning
		let warnObj = warnArray[warnIndex];
		let warnLoc = warnObj.where;
		let warnValue = warnObj.hypo;
		let warnMsg = warnObj.message;
		let texte = warnLoc+" "+warnValue+" : "+warnMsg;
		let liTag = document.createElement("li");
		liTag.innerHTML=texte;
		liTag.setAttribute("class","warning");
		errorTag.appendChild(liTag);
		// highlight warning in grid
		let hypoId = warnLoc+"_"+warnValue;
		let hypoTag = document.getElementById(hypoId);
		hypoTag.className = "hypo warning";
	}
}

function colorGroupBorder (_groupId) {
	let groupList = grid.getGroup(_groupId);
	if (_groupId.indexOf("L") != -1) {
		// group is a line
		let line = _groupId.substr(1,1);
		colorBorder (groupList, line, "I", line, "A");
	} else if (_groupId.indexOf("C") != -1) {
		// group is a column
		let column = _groupId.substr(1,1);
		colorBorder (groupList, 1, column, 9, column);
	} else if (_groupId.indexOf("Q") != -1) {
		// group is a quarter
		let quartier = _groupId.substr(1,1);
		let x = (quartier-1)%3;
		let y = parseInt((quartier-1)/3);
		let top = y*3+1;
		let bottom = y*3+3;
		let right = cols[x*3+2];
		let left = cols[x*3];
		colorBorder (groupList, top, right, bottom, left);
	}
}

function colorBorder (_groupList, _top, _right, _bottom, _left) {
	let groupIndex;
	for ( groupIndex in _groupList) {
		let cellId = _groupList[groupIndex];
		// initialize style
		let cellTag = document.getElementById("Cell_"+cellId);
		let style = cellTag.style;
		// calculate style
		if (cellId.indexOf(_top) != -1) {
			style += "border-top-color: red;";
		}
		if (cellId.indexOf(_right) != -1) {
			style += "border-right-color: red;";
		}
		if (cellId.indexOf(_bottom) != -1) {
			style += "border-bottom-color: red;";
		}
		if (cellId.indexOf(_left) != -1) {
			style += "border-left-color: red;";
		}
		// set border
		cellTag.style=style;
	}
}

function displaySolutions() {
	// get start date
	let start = new Date();
	// reset solution list in page
	resetSolutionList();

	// disable grid
	disableGrid(true);

	let liTag;
	let solTag = document.getElementById("solutionList");
	//display initial grid
	liTag = document.createElement("li");
	liTag.innerHTML=grid.toString();
	liTag.addEventListener("click", function(){ loadAGrid(this); });
	solTag.appendChild(liTag);	
	// indicate calculation will start
	liTag = document.createElement("li");
	liTag.setAttribute("id","solutionListStatus");
	liTag.innerHTML="Starting solutions calculation ...";
	solTag.appendChild(liTag);
	// reset solutions
	solutionsList.resetSolutions();
	// calculate solutions based on current grid
	if (window.Worker) {
		if (myWorker != undefined) {
			// stop worker before start a new one
			myWorker.terminate();
			myWorker = undefined;
		}
		// run asynchronous if possible
		myWorker = new Worker("calculateSolutionsWorker.js");
		myWorker.onmessage = function(event) {
			let action = event.data[0];
			if ( action == "SOL" )  {
				// the event data is a solution
				displayOneSolution(event.data[1]);
			} else if ( action == "END" ) {
				// get solutions
				let listOfSolution = event.data[1].solutionList;
				solutionsList = new solutions(listOfSolution);
				// end of worker
				myWorker.terminate();
				myWorker = undefined;
				// display calculation completion
				completeSolutionsDisplay(start);
			} 
		};
		let msg = ["START",grid.toString()];
		myWorker.postMessage(msg);	
	} else {
		// if not possible, run synchronous
		// get first cell from the grid
		let cell = grid.getCell("A_1");
		// calculate solutions based on current grid
		// this function also call displayOneSolution as soon as the solution is found
		solutionsList.calculateSolutions( grid, cell , displayOneSolution );
		completeSolutionsDisplay(start);
	}
}

function stopCalculation() {
	if (window.Worker) {
		// if worker is defined
		if (myWorker != undefined) {
			// terminate worker
			myWorker.terminate();
			myWorker = undefined;
			// display calculation cancelled
			let liTag = document.getElementById("solutionListStatus");
			liTag.innerHTML="Solutions calculation cancelled.";
		}
	} else {
		// stop calculation
		solutionsList.stop();
	}
}

function completeSolutionsDisplay(_start) {
	// end date
	let end = new Date();
	let duration = end - _start;
	// calculation completed
	let liTag = document.getElementById("solutionListStatus");
	liTag.innerHTML="Solutions calculation completed with "+solutionsList.getNumberOfSolutions()+" solutions in "+duration/1000+" seconds.";
	// enable grid
	disableGrid(false);
	// display grid
	display(grid);	
}

function displayOneSolution(_solStr) {
	// display the number of solutions
	let solTag = document.getElementById("solutionList");
	// display one solution
	let liTag = document.createElement("li");
	liTag.innerHTML=_solStr;
	liTag.addEventListener("click", function(){ loadAGrid(this); });
	solTag.appendChild(liTag);
}
 
function disableGrid(_disableDisplay) {
	// if disable is true, then disable, else enable
	if (_disableDisplay) {
		// disable grid table
		let tableTag = document.getElementById("tableGrid");
		tableTag.disabled="disabled";
		// disable hypo
		let nodeList;
		nodeList = document.querySelectorAll("table.hypo");
		for (let i = 0; i < nodeList.length; i++) {
			nodeList[i].disabled = "disabled";
		}
		// disable value
		nodeList = document.querySelectorAll("span.value");
		for (let i = 0; i < nodeList.length; i++) {
			nodeList[i].disabled = "disabled";
		}
	} else {
		// enable grid table
		let tableTag = document.getElementById("tableGrid");
		tableTag.disabled="";
		// enable hypo
		let nodeList;
		nodeList = document.querySelectorAll("table.hypo");
		for (let i = 0; i < nodeList.length; i++) {
			nodeList[i].disabled = "";
		}
		// enable value
		nodeList = document.querySelectorAll("span.value");
		for (let i = 0; i < nodeList.length; i++) {
			nodeList[i].disabled = "";
		}
	}
}

function loadAGrid(_linkTag) {
	let gridDescription = _linkTag.innerHTML;
	
	// read string and reset the grid with info
	grid.readString(gridDescription);
	// check for errors
	grid.checkErrors();
	// display grid
	display(grid);
}

