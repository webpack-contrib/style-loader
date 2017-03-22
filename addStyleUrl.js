/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

function attachTagAttrs(element, attrs) {
	Object.keys(attrs).forEach(function (key) {
		element.setAttribute(key, attrs[key]);
	});
}

module.exports = function addStyleUrl(cssUrl, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	var styleElement = document.createElement("link");
	styleElement.rel = "stylesheet";
	styleElement.type = "text/css";
	styleElement.href = cssUrl;

	attachTagAttrs(styleElement, options.attrs);

	var head = document.getElementsByTagName("head")[0];
	head.appendChild(styleElement);
	if(module.hot) {
		return function(cssUrl) {
			if(typeof cssUrl === "string") {
				styleElement.href = cssUrl;
			} else {
				head.removeChild(styleElement);
			}
		};
	}
}