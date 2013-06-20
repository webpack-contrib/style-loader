/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function(cssUrl) {
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