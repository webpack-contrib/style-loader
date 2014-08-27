/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function addStyle(cssCode) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}
	var styleElement = document.createElement("style"),
		head = document.head || document.getElementsByTagName("head")[0];
	styleElement.type = "text/css";
	head.appendChild(styleElement);
	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = cssCode;
	} else {
		styleElement.appendChild(document.createTextNode(cssCode));
	}
	if(module.hot) {
		return function(cssCode) {
			if(typeof cssCode === "string") {
				if (styleElement.styleSheet) {
					styleElement.styleSheet.cssText = cssCode;
				} else {
					styleElement.childNodes[0].nodeValue = cssCode;
				}
			} else {
				dispose();
			}
		};
	} else {
		// For the useable API, provide a function to remove the stylesheet.
		return dispose;
	}

	function dispose() {
		head.removeChild(styleElement);
	}
};
