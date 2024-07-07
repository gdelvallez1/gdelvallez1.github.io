 
function verif(){
  alert((is_RIO(document.getElementById("rio").value, document.getElementById("msisdn").value) ));
  return false;
}
function is_RIO(sRio, sMsisdn){
    if(sRio.length !=12) return "Le code RIO doit comporter 12 caractères, ne pas mettre d'espaces";
    if (sMsisdn.substr(0,1)!=0) return "Le numéro de téléphone doit commencer par 0";
    if (sMsisdn.length !=10) return "Le numéro de téléphone devrait faire 10 caractères";
    var sOperateur=sRio.substr(0, 2);
    var sTypeContrat=sRio.substr(2, 1);
    var sRefClient=sRio.substr(3, 6);
	// type de Contrat ligne mobile : PE
	// type de Contrat ligne fixe : FGMNRSTUVWXYZ
	var stypeContratAutorise = "PEFGMNRSTUVWXYZ";
    if(stypeContratAutorise.indexOf(sTypeContrat) < 0) return "Il doit y avoir une erreur dans votre code RIO (3emeCaractère)";
    var sOrdre="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+";
    var nRes=new Array(0, 0, 0);
    var sTmp=sOperateur+sTypeContrat+sRefClient+sMsisdn;
    for(n=0;n<19;n++) {
        var nPos=sOrdre.indexOf(sTmp.substr(n, 1));
        nRes[0]=(nRes[0]+nPos)%37;
        nRes[1]=((2*nRes[1])+nPos)%37;
        nRes[2]=((4*nRes[2])+nPos)%37;
    }
    var sCleCalculee=sOrdre.substr(nRes[0],1)+sOrdre.substr(nRes[1],1)+sOrdre.substr(nRes[2],1);
    if(sRio.substr(9)!=sCleCalculee) return "Il doit y a voir une erreur dans votre code RIO ("+sCleCalculee+")";
    return "Code RIO correct !";
}