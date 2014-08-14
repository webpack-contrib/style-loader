/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function addStyleUrl(cssUrl, nextElementSibling) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}
	var styleElement = document.createElement("link");
	styleElement.rel = "stylesheet";
	styleElement.type = "text/css";
	styleElement.href = cssUrl;
	var head = document.getElementsByTagName("head")[0];
	head.insertBefore(styleElement, nextElementSibling || null);
	return function(data) {
		data.nextEl = styleElement.nextElementSibling;
		head.removeChild(styleElement);
	};
}
