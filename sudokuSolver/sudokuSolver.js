// SudokuSolver.js

var grid = undefined;
var solutionsList = undefined;

grid = new gridBean();
solutionsList = new solutions();

display(grid);

//calculateManualSolutions();

//calculateAllSolutions();

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
	let cellId = _cellTag.id;
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
		let valueTag = document.getElementById(cellId);
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
				if (i !== "0") {
					hypoId=cellId+"_"+i;
					oneHypoTag = document.getElementById(hypoId);
					oneHypoTag.innerHTML=validHypo[i];
				}
			}
		}
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
		errorTag.appendChild(liTag);		
	}
	// display error list
	let errorArray = _grid.getErrorList();
	for (let errorIndex in errorArray ) {
		let errorObj = errorArray[errorIndex];
		let errorLoc = errorObj.where;
		let errorMsg = errorObj.message;
		let texte = errorLoc+" : "+errorMsg;
		let liTag = document.createElement("li");
		liTag.innerHTML=texte;
		liTag.setAttribute("class","error");
		errorTag.appendChild(liTag);
	}
	// display warning list
	let warnArray = _grid.getWarningList();
	for (let warnIndex in warnArray ) {
		let warnObj = warnArray[warnIndex];
		let warnLoc = warnObj.where;
		let warnMsg = warnObj.message;
		let texte = warnLoc+" : "+warnMsg;
		let liTag = document.createElement("li");
		liTag.innerHTML=texte;
		liTag.setAttribute("class","warning");
		errorTag.appendChild(liTag);
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
		// run asynchronous if possible
		let w = new Worker("calculateSolutionsWorker.js");
		w.onmessage = function(event) {
			if ( event.data[0] == "SOL" )  {
				// the event data is a solution
				displayOneSolution(event.data[1]);
			} else {
				// get solutions
				let listOfSolution = event.data[1].solutionList;
				solutionsList = new solutions(listOfSolution);
				// end of worker
				w.terminate();
				w = undefined;
				// display calculation completion
				completeSolutionsDisplay(start);
			} 
		};
		w.postMessage(grid.toString());	
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

