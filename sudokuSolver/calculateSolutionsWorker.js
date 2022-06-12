importScripts('gridBean.js')
importScripts('solutions.js')

var cell;
var grid = undefined;
var solutionsList = undefined;

function displayOneSolution(sol) {
	postMessage(["SOL",sol]);
}

function searchSolutions () {
	// calculate solutions based on current grid
	// this function also call displayOneSolution as soon as the solution is found
	solutionsList.calculateSolutions( grid, cell, displayOneSolution );
	// when completed
	postMessage(["END",solutionsList]);
}

onmessage = function(e) {
	// initialize grid
	grid = new gridBean();
	grid.readString(e.data);
	// initialize solutionsList
	solutionsList = new solutions();
	// initialize first cell
	cell = grid.getCell("A_1");
	// search Solutions
	searchSolutions();
}

