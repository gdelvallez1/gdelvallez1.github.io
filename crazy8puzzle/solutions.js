// solutions.js


function solutions() {
	// liste des solutions 
	// solutionList[solutionCode]= {root:rootSolutionCode, transform="Sym"}
	this.solutionList={};
}

solutions.getSolutions = function() {
	var solutions_=undefined;
	if(typeof(Storage) !== "undefined") {
		// Code for localStorage/sessionStorage.
		var solutionsStr=sessionStorage.getItem("solutions");
		if ((solutionsStr !== undefined)&&(solutionsStr!= null)) {
			solutions_=new solutions();
			solutions_.deserialize(solutionsStr);
		}
	}
	return solutions_;
};

solutions.storeSolutions = function(solutions_) {
	var solutionsStr;
	if(typeof(Storage) !== "undefined") {
    	// Code for localStorage/sessionStorage.
    	solutionsStr=solutions_.serialize();
    	sessionStorage.setItem("solutions", solutionsStr);
	}
};

solutions.prototype.isOriginalSolution = function(solution_) {
	var solutionCode = solution_.getSolutionCode();
	if (this.solutionList == null) {
		// if there no list, the first one is Original !
		return true;
	}
	if ( this.solutionList[solutionCode] == undefined) {
		// if solution is not known, then it is original
		return true;
	} else {
		// known solution
		if ( this.solutionList[solutionCode].root === solutionCode ) {
			// this solution is a root solution, so is original
			return true;
		} else {
			// this solution is not root, so is not original
			return false;
		}
	}
};

solutions.prototype.getSolution = function(solution_) {
	var solutionCode = solution_.getSolutionCode();
	var solution_2 = this.solutionList[solutionCode];
	if ( solution_2  == undefined) {
		// unknown solution
		return undefined ;
	} else {
		// known solution
		// get solution from list of solutions
		return solution_2 ;
	}
};

solutions.prototype.addSolution = function (solution_ , parentSolution_, transform) {
	var solutionCode=solution_.getSolutionCode();
	if ((this.solutionList != null) && (this.solutionList[solutionCode] != undefined)) {
		// this solution is known, 
		// nothing to do with this, as already done.
		return false;
	} else {
		// The solution is not a known solution. 
		// Need to store it.
		var rootSolutionCode = solutionCode;
		var parentTransform = "";
		if (parentSolution_ != undefined) {
			//there is a parent solution
			var parentSolutionCode = parentSolution_.getSolutionCode();
			// the rootSolution is the same as the parent
			rootSolutionCode = this.solutionList[parentSolutionCode].root; 
			parentTransform = this.solutionList[parentSolutionCode].transform;
		}
		// store solution
		this.solutionList[solutionCode]=new solution(solutionCode);
		this.solutionList[solutionCode].root =  rootSolutionCode;
		this.solutionList[solutionCode].transform =  parentTransform + " " + transform;

	return true;
	}
};

solutions.prototype.addRootSolution = function (solution_) {
	var added = this.addSolution( solution_, undefined, "");
	if (added) {
		// add child solutions
		this. addChildSolution(solution_);
	}
};

solutions.prototype.addChildSolution = function (solution_) {
	// calcul child solutions of solution_
	solution_.calculateChilds();

	// store child solutions of solution_
	var addedSymH = this.addSolution(solution_.getChildSymH(), solution_, "Sym.H");
	var addedSymV = this.addSolution(solution_.getChildSymV(), solution_, "Sym.V");
	var addedSymD1 = this.addSolution(solution_.getChildSymD1(), solution_, "Sym.D1");
	var addedSymD2 = this.addSolution(solution_.getChildSymD2(), solution_, "Sym.D2");
	var addedRot1 = this.addSolution(solution_.getChildRot1(), solution_, "Rot.1/4" );
	var addedRot2 = this.addSolution(solution_.getChildRot2(), solution_, "Rot.1/2" );
	var addedRot3 = this.addSolution(solution_.getChildRot3(), solution_, "Rot.3/4" );

	// add child solutions for each child
	if ( addedSymH ) {
		this.addChildSolution(solution_.getChildSymH());
	}
	if ( addedSymV ) {
		this.addChildSolution(solution_.getChildSymV());
	}
	if ( addedSymD1 ) {
		this.addChildSolution(solution_.getChildSymD1());
	}
	if ( addedSymD2 ) {
		this.addChildSolution(solution_.getChildSymD2());
	}
	if ( addedRot1 ) {
		this.addChildSolution(solution_.getChildRot1());
	}
	if ( addedRot2 ) {
		this.addChildSolution(solution_.getChildRot2());
	}
	if ( addedRot3 ) {
		this.addChildSolution(solution_.getChildRot3());
	}
};

solutions.prototype.statistiques=function() {
	var stat = {};
	var nbSolutions = 0;
	var nbRootSolutions = 0;
	for (var solCode in this.solutionList) {
		nbSolutions +=1;
		if (solCode === this.solutionList[solCode].root) {
			nbRootSolutions +=1;
		}
	}
	stat.nbSolutions = nbSolutions;
	stat.nbRootSolutions = nbRootSolutions;
	return stat;
};

solutions.prototype.searchSolutions=function(grid, x) {
	for (var y = 1; y <= 8; y++) { 
		if (x === 1) {
			// initialize grid when first row 
			grid = new gridBean();
		}
		var cell = grid.getCellXY(x,y);
		// cell is free (not used by any counter, not in this one either)
		if (cell.usedCount === 0 && !cell.counter) {
			// add counter there
			grid.manageCounter(cell);
			// if x is 8, then we have a solution
			if ( x >= 8 ) {
				var solString = grid.toString().trim();
				var sol = new solution(solString );	
				this.addRootSolution (sol);
			} else {
				// continue to look deeper in the grid
				var xp1 = x+1;
				this.searchSolutions(grid, xp1);
			}
			// remove counter, to look for other solutions
			grid.manageCounter(cell);
		}
	}
};

solutions.prototype.serialize=function() {
	var solutionsStr='';
	solutionsStr = JSON.stringify(this.solutionList);
	return solutionsStr;
};

solutions.prototype.deserialize=function(solutionsStr) {
	// read the string
	var solutions_ = JSON.parse(solutionsStr);
	// initialize the solutions
	this.solutionList=solutions_;
};

//*********************************************************
//*********************************************************

function solution(solutionCode_) {
	// solution
	// solution code is String like "(X,Y) (X,Y) ..."
	this.solutionCode=solutionCode_;
	// solution childs
	this.childSymH=undefined;
	this.childSymV=undefined;
	this.childSymD1=undefined;
	this.childSymD2=undefined;
	this.childRot1=undefined;
	this.childRot2=undefined;
	this.childRot3=undefined;
}

solution.prototype.getSolutionCode = function() {
	return this.solutionCode;
};

solution.prototype.calculateChilds = function() {
	// get list of counters
	var listCounter_ = this.getListCounters();
	var childSymHCounter = [9];
	var childSymVCounter = [9];
	var childSymD1Counter = [9];
	var childSymD2Counter = [9];
	var childRot1Counter = [9];
	var childRot2Counter = [9];
	var childRot3Counter = [9];

	// for each counter
	for (var x in listCounter_) {
		var y = listCounter_[x];
		var xChild;
		var yChild;
		// ChildSymH 
		xChild = x;
		yChild = 8+1-y;
		childSymHCounter[xChild] = yChild;
		// ChildSymV
		xChild = 8+1-x;
		yChild = y;
		childSymVCounter[xChild] = yChild;
		// ChildSymD1
		xChild = y;
		yChild = x;
		childSymD1Counter[xChild] = yChild;
		// ChildSymD2
		xChild = 8+1-y;
		yChild = 8+1-x;
		childSymD2Counter[xChild] = yChild;
		// ChildRot1
		xChild = y;
		yChild = 8+1-x;
		childRot1Counter[xChild] = yChild;
		// Child Rot2
		xChild = 8+1-x;
		yChild = 8+1-y;
		childRot2Counter[xChild] = yChild;
		// Child Rot3
		xChild = 8+1-y;
		yChild = x;
		childRot3Counter[xChild] = yChild;
	}
	// Create solution code
	var childSymHCode="", childSymVCode="", childSymD1Code="", childSymD2Code="", childRot1Code="", childRot2Code="", childRot3Code="";
	for (var xx = 1; xx <= 8; xx++) { 
		childSymHCode += "("+xx+","+childSymHCounter[xx]+") ";
		childSymVCode += "("+xx+","+childSymVCounter[xx]+") ";
		childSymD1Code += "("+xx+","+childSymD1Counter[xx]+") ";
		childSymD2Code += "("+xx+","+childSymD2Counter[xx]+") ";

		childRot1Code += "("+xx+","+childRot1Counter[xx]+") ";
		childRot2Code += "("+xx+","+childRot2Counter[xx]+") ";		
		childRot3Code += "("+xx+","+childRot3Counter[xx]+") ";
	}
	// create childs
	this.childSymH = new solution(childSymHCode.trim());
	this.childSymV = new solution(childSymVCode.trim());
	this.childSymD1 = new solution(childSymD1Code.trim());
	this.childSymD2 = new solution(childSymD2Code.trim());
	this.childRot1 = new solution(childRot1Code.trim());
	this.childRot2 = new solution(childRot2Code.trim());
	this.childRot3 = new solution(childRot3Code.trim());
	return;
};

solution.prototype.getListCounters = function() {
	if (this.listCounter == undefined) {
		// generate list counter;
		var listCounter_=[9];
		// read grid description
		var counterList = this.getSolutionCode().split(" ");
		// for each counter
		for (var i in counterList) {
			// get id, get cell
			var id=counterList[i].replace("(", "").replace(")", "").split(",");
			//
			listCounter_[id[0]]=id[1];
		}
		this.listCounter=listCounter_;
	}
	return this.listCounter;
};

solution.prototype.getChildSymH = function() {
	return this.childSymH;
};

solution.prototype.getChildSymV = function() {
	return this.childSymV;
};

solution.prototype.getChildSymD1 = function() {
	return this.childSymD1;
};

solution.prototype.getChildSymD2 = function() {
	return this.childSymD2;
};

solution.prototype.getChildRot1 = function() {
	return this.childRot1;
};

solution.prototype.getChildRot2 = function() {
	return this.childRot2;
};

solution.prototype.getChildRot3 = function() {
	return this.childRot3;
};

