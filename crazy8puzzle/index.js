// index.js

var grid = undefined;
var solutionsList = undefined;

grid = gridBean.getGrid();
// solutionsList = solutions.getSolutions();

if (grid == undefined) {
	grid = new gridBean();
	gridBean.storeGrid(grid);
}

if (solutionsList == undefined) {
	solutionsList = new solutions();
	solutions.storeSolutions(solutionsList);
}

display(grid);

//calculateManualSolutions();

//calculateAllSolutions();

function resetGrid() {
	grid = new gridBean();
	// check for errors
	grid.checkErrors();
	gridBean.storeGrid(grid);
	solutionsList = new solutions();
	solutions.storeSolutions(solutionsList);
	display(grid);
}

// manage click on cell
function toggleCounter(cellTag) {
	var id = cellTag.id;
	var cellBean = grid.getCell(id);
	// update the grid
	grid.manageCounter(cellBean);
	// check for errors
	grid.checkErrors();
	// save grid
	gridBean.storeGrid(grid);
	// display grid
	display(grid);
}

// set info into cell
function display(grid_) {
	for (var cellId in grid_.getCells()) {
		var cell = grid_.getCell(cellId);
		var classes = "cell used" + cell.usedCount;
		classes += cell.counter ? " counter" : "" ;
		var text="";
		if (cell.counter) {
			text ="X";
		}
		var cellTag = document.getElementById(cellId);
		cellTag.setAttribute("class",classes);	
		cellTag.innerHTML=text;
	}
	
	document.getElementById("nbCounter").innerHTML=grid_.getNbCounter();
	document.getElementById("missingCounter").innerHTML=8-grid_.getNbCounter();
	document.getElementById("counters").innerHTML=grid_.toString();
	document.getElementById("status").innerHTML=grid_.getStatus();
	
	// display errors
	for (var errorId in grid_.getErrors() ) {
		var errorMsg=grid_.getErrors()[errorId];
		var errorTag = document.getElementById(errorId);
		if (errorTag == undefined) {
			if(errorMsg !== "") {
				document.getElementById("status").innerHTML+=";"+errorId+":"+errorMsg;
			}
		} else {
			errorTag.innerHTML=errorMsg;			
		}
	}

}

function loadAGrid(linkTag) {
	var gridDescription = linkTag.innerHTML;
	
	// read string and reset the grid with info
	grid.readString(gridDescription);
	// check for errors
	grid.checkErrors();
	// save grid
	gridBean.storeGrid(grid);
	// display grid
	display(grid);
}

function isSolutionDuplicate(spanTag) {
	var description = spanTag.previousSibling.innerHTML;
	
	// get the solutions including symetry and rotate 
	var solution_ = new solution (description);
	var isOriginalSolution = solutionsList.isOriginalSolution (solution_);
	solutionsList.addRootSolution(solution_);
	solution_=solutionsList.getSolution(solution_);

	var texte = "";
	if (!isOriginalSolution) {
		texte = solution_.transform + " Of " + solution_.root;
	} else {
		texte = " Original!";
	}
	spanTag.innerHTML = texte;

	var stat = solutionsList.statistiques();
	document.getElementById("nbOfSolutions").innerHTML=stat.nbSolutions;
	document.getElementById("nbOfRootSolutions").innerHTML=stat.nbRootSolutions;		
}

function calculateManualSolutions() {
	var olTag = document.getElementById("solutions");
	for (var i=0 ; i< olTag.children.length ; i++) {
		var liTag = olTag.children[i];
		var spanTag2 = liTag.firstChild.nextSibling;
		isSolutionDuplicate(spanTag2);
	}
	//store solutions
	solutions.storeSolutions(solutionsList);
}

function calculateAllSolutions() {
	var ulTag = document.getElementById("calculatedSolutions");
	var calcSolList = new solutions();
	// calculate solutions
	var x = 1;
	calcSolList.searchSolutions(undefined,x);
	// Stats
	var stat = calcSolList.statistiques();
	document.getElementById("nbOfSolutionsCalc").innerHTML=stat.nbSolutions;
	document.getElementById("nbOfRootSolutionsCalc").innerHTML=stat.nbRootSolutions;
	// display solutions
	var solList = calcSolList.solutionList;
	for ( var solCode in solList ) {
		var sol = solList[solCode];
		// add a <li> child
		var liTag = document.createElement("li");
		var texte = '<span onclick="loadAGrid(this);">' + solCode + '</span>';
		if (calcSolList.isOriginalSolution(sol)) {
			texte += " Original!";
		} else {
			texte += " " + sol.transform + " of " + sol.root ;
		}
		liTag.innerHTML=texte;
		ulTag.appendChild(liTag);
	}
}
