//Livre1 : id html
//livre1 : elem html du Livre1
//l1: nb de page lu entré par util

function initMinMax() {
	var errorMsg = "";
	var pagesTotal = 0;
	var inputNumberList = document.querySelectorAll("span.field input[type=number]");
	for ( var inputElt of inputNumberList) {
		var ident = inputElt.id;
		var minVal = parseInt(inputElt.min);
		var maxVal = parseInt(inputElt.max);
		var minStr = isNaN(minVal) ? "ND 1" : minVal;
		var minVal = isNaN(minVal) ? 1 : minVal;
		var maxStr = isNaN(maxVal) ? "ND ERR" : maxVal;
		var maxVal = isNaN(maxVal) ? undefined : maxVal;
		var noteElt = inputElt.parentElement.querySelector("span.note");
		noteElt.innerText = " min: "+minStr+" - max: "+maxStr;
		if ( maxVal != undefined ) {	
			//maj pagesTotal
			pagesTotal += maxVal - minVal + 1 ; 
		} else {
			errorMsg = "Attention : valeur MANQUANTE ("+ident+") !!!";
		}
	}
	var totalElt = document.getElementById("total");
	totalElt.innerText = pagesTotal;
	document.getElementById("Message").innerHTML=errorMsg;
}

function resu() {
	// init variables
	var date = document.getElementById("jour").valueAsDate;
	if ( date === null ) { 
		date = new Date();
		date.setUTCHours(0, 0, 0, 0);
		document.getElementById("jour").valueAsDate=date;
	}
	var date_fin = document.getElementById("dernier").valueAsDate;
	if ( date_fin === null ) { 
		date_fin = new Date("2022-08-29");
		date_fin.setUTCHours(0, 0, 0, 0);
		document.getElementById("dernier").valueAsDate=date_fin;
	}
	var pagesTotal = 0;
	var pagesLues = 0;
	var errorMsg = "";

	// calculate read pages and total pages to read
	var inputNumberList = document.querySelectorAll("span.field input[type=number]");
	for ( var inputElt of inputNumberList) {
		var ident = inputElt.id;
		var minVal = parseInt(inputElt.min);
		var maxVal = parseInt(inputElt.max);
		var page = parseInt(inputElt.value);
		var minVal = isNaN(minVal) ? 1 : minVal;
		var maxVal = isNaN(maxVal) ? undefined : maxVal;
		var page = isNaN(page) ? minVal - 1 : page;
		if ( maxVal != undefined ) {
			pagesLues += page - minVal + 1 ;
			pagesTotal += maxVal - minVal + 1 ;
		} else {
			errorMsg = "Attention : Calcul INCOMPLET ("+ident+") !!!";
		}
	}

	// calculate duration
	var diff = date_fin.getTime() - date.getTime();
	// convert ms to days
	var temps = diff / (1000 * 3600 * 24); 
	
	// calculate pages to read
	var pages = pagesTotal - pagesLues ;
	
	// calculate speed to complete reading
	var vitesse = pages / temps ;
	
	// display results
	document.getElementById("A-lire").innerHTML=pages ;
	document.getElementById("EnJour").innerHTML=temps ;
	document.getElementById("LireParJour").innerHTML=vitesse.toFixed(2) ;
	document.getElementById("Message").innerHTML=errorMsg;
}
