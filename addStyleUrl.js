/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function(cssUrl) {
	var styleElement = document.createElement("link");
	styleElement.rel = "stylesheet";
	styleElement.type = "text/css";
	styleElement.href = cssUrl;
	document.getElementsByTagName("head")[0].appendChild(styleElement);
}