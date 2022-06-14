importScripts('gridBean.js')
importScripts('solutions.js')

var cell1;
var grid1 = undefined;
var solutionsList1 = undefined;

function displayOneSolution(sol) {
	postMessage(["SOL",sol]);
}

function searchSolutions () {
	// calculate solutions based on current grid
	// this function also call displayOneSolution as soon as the solution is found
	solutionsList1.calculateSolutions( grid1, cell1, displayOneSolution );
	// when completed
	postMessage(["END",solutionsList]);
}

onmessage = function(e) {
	// initialize grid
	grid1 = new gridBean();
	grid1.readString(e.data);
	// initialize solutionsList
	solutionsList1 = new solutions();
	// initialize first cell
	cell1 = grid1.getCell("A_1");
	// search Solutions
	searchSolutions();
}

