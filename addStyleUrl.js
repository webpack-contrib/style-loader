/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var isInBrowser = require('./isInBrowser');
var emptyFunction = require('./emptyFunction');

module.exports = function(cssUrl) {
	if (!isInBrowser()) {
		return emptyFunction;
	}

	var styleElement = document.createElement("link");
	styleElement.rel = "stylesheet";
	styleElement.type = "text/css";
	styleElement.href = cssUrl;
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(styleElement);
	return function() {
		head.removeChild(styleElement);
	};
}