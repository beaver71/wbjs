/* global definitions */

var stage;	// visibile in ogni classe di wb
var traceEnabled = true;

function getStage(id) {
	stage = new createjs.Stage(id);
	return stage;
}

/**
 * Trasforma numero decimale in stringa hex (#FF0000).
 */
function numToHex(c) {
	var hex = c.toString(16);
	hex = "000000" + hex;
	return "#"+hex.slice(hex.length-6,hex.length);
}

/**
 * Trasforma stringa hex (#FF0000) in numero decimale.
 */
function hexToNum(c) {
	var hex = c.replace("#", "");
	return parseInt(hex, 16);
}

function trace(txt) { 
	console.log(txt);
	if (traceEnabled) {
		var textarea = document.getElementById('logTxt');
		if (textarea) {
			textarea.innerHTML += txt+"\n";
			textarea.scrollTop = textarea.scrollHeight;
		}
	}
}

function logging(txt) { 
	trace(txt);
}