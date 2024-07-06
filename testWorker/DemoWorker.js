let i = 0;

function timedCount() {
  i ++;
  postMessage(i);
  let y =0;
  for (let x = 0; x <= 10 ; x++) {
	  //
	  y=y*x;
  }
  setTimeout("timedCount()",500);
}

timedCount(); 