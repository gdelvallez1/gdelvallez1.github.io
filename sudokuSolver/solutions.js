// solutions.js


function solutions(_solutionList) {
	// liste des solutions 
	// solutionList[solutionCode]= solutionCode
	if ( _solutionList == undefined) {
		// no solution list ==> reset Solutions
		this.resetSolutions();
	} else {
		// assign solutionList
		this.solutionList = _solutionList;
		this.stopFlag = false;
	}
}

solutions.prototype.resetSolutions = function () {
	this.solutionList={};
	this.stopFlag = false;
}

solutions.prototype.stop = function () {
	this.stopFlag = true;
	console.log("solutions stop registered:"+this.stopFlag);
}

solutions.prototype.getSolutions = function () {
	return this.solutionList;
}

solutions.prototype.getNumberOfSolutions = function () {
	// init
	let cpt=0;
	// count number of solutions
	for ( let solCode in this.solutionList ) {
		cpt++;
	}
	return cpt;
}

solutions.prototype.addSolution = function (_solutionCode) {
	if ((this.solutionList != null) && (this.solutionList[_solutionCode] != undefined)) {
		// this solution is known, 
		// nothing to do with this, as already done.
		return false;
	} else {
		// The solution is not a known solution. 
		// Need to store it.
		this.solutionList[_solutionCode]=_solutionCode;
		return true;
	}
};

solutions.prototype.calculateSolutions = function ( _grid, _cell , _displayOneSolution) {
	// if cell is undefined
	if (_cell == undefined) {
		// it is a faulure as it allow to work with next hypothesis.
		return "FAILED";
	}
	// if calculation is stopped, end now
	if(this.stopFlag) {
		console.log("solutions stop for cell "+_cell.id);
		return "FAILED";
	}

	let status;
	// if cell has a value, 
	if (_cell.value !="") {
		// then work with next cell
		let nextCell = _grid.getNextCell(_cell);
		status = this.calculateSolutions( _grid, nextCell, _displayOneSolution);
		return status;
	} else
	{
		// for each valid hypothesis
		for (let hypoId in _cell.validHypothesis) {
			// if calculation is stopped, end now
			if(this.stopFlag) {
				console.log("solutions stop for hypo "+_cell.id + " " + hypoId);
				return "FAILED";
			}
			// use valid Hypothesis only
			if (_cell.validHypothesis[hypoId] == hypoId) {
				// set one hypothesis
				_grid.setHypothesis(_cell,hypoId);
				// check for errors
				_grid.checkErrors();	
				
				// check status,
				status = _grid.getStatus();
				// if status failed
				if ( status == "FAILED" ) {
					// reset value
					_grid.resetValue(_cell);
					// check for errors
					_grid.checkErrors();
					// test next hypothesis
				} else if ( status == "WIN" ) {
					// if status is WIN
					// store the solution
					let sol =_grid.toString();
					let added = this.addSolution(sol);
					if (added) {
						_displayOneSolution(sol);
					}
					// reset value
					_grid.resetValue(_cell);
					// check for errors
					_grid.checkErrors();
					// test next hypothesis
				} else {
					// if status is ""
					// then work with next cell
					let nextCell = _grid.getNextCell(_cell);
					status = this.calculateSolutions( _grid, nextCell,_displayOneSolution);
					// if failed 
					if ( status == "FAILED" ) {
						// reset value
						_grid.resetValue(_cell);
						// check for errors
						_grid.checkErrors();
						// test next hypothesis
					}
				}
			}
		}
		// if all hypothesis are failed,
		// then this cell is failed 
		return "FAILED";
	}
}
