// SudokuSolver.js

var grid = undefined;
var solutionsList = undefined;
var worker = undefined;

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
				// index i = 0 is not a valid index
				if (i !== "0") {
					// get hypothesis value
					let hypoVal=validHypo[i];
					let hypoId = cellId+"_"+i;
					oneHypoTag = document.getElementById(hypoId);
					oneHypoTag.innerHTML=hypoVal;
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
	}
	// display warning list
	let warnArray = _grid.getWarningList();
	for (let warnIndex in warnArray ) {
		let warnObj = warnArray[warnIndex];
		let warnLoc = warnObj.where;
		let warnValue = warnObj.hypo;
		let warnMsg = warnObj.message;
		let texte = warnLoc+" "+warnValue+" : "+warnMsg;
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
		if (worker != undefined) {
			// stop worker before start a new one
			console.log("stop existing worker before start new one");
			worker.terminate();
			worker = undefined;
		}
		// run asynchronous if possible
		worker = new Worker("calculateSolutionsWorker.js");
		worker.onmessage = function(event) {
			let action = event.data[0];
			if ( action == "SOL" )  {
				// the event data is a solution
				displayOneSolution(event.data[1]);
			} else if ( action == "END" ) {
				console.log("message from worker "+action);
				// get solutions
				let listOfSolution = event.data[1].solutionList;
				solutionsList = new solutions(listOfSolution);
				// end of worker
				worker.terminate();
				worker = undefined;
				// display calculation completion
				completeSolutionsDisplay(start);
			} 
		};
		worker.postMessage(["START",grid.toString()]);	
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
	console.log("stop calculation requested");
	if (window.Worker) {
		// if worker is defined
		if (worker != undefined) {
			// terminate worker
			console.log("terminate worker");
			worker.terminate();
			worker = undefined;
			// display calculation cancelled
			let liTag = document.getElementById("solutionListStatus");
			liTag.innerHTML="Solutions calculation cancelled.";
		}
	} else {
		// stop calculation
		console.log("solutions stop call");
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

