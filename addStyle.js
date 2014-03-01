/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var isInBrowser = require('./isInBrowser');
var emptyFunction = require('./emptyFunction');

module.exports = function(cssCode) {
	if (!isInBrowser()) {
		return emptyFunction;
	}

	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = cssCode;
	} else {
		styleElement.appendChild(document.createTextNode(cssCode));
	}
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(styleElement);
	return function() {
		head.removeChild(styleElement);
	};
}