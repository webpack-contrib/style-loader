/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function addStyle(cssCode, priority) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	styleElement.setAttribute("data-priority", priority);
	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = cssCode;
	} else {
		styleElement.appendChild(document.createTextNode(cssCode));
	}

	var head = document.getElementsByTagName("head")[0];
	var styles = head.getElementsByTagName("style");
	var before = null;
	for (var i = 0; i < styles.length; i++) {
	    var s = styles[i];
	    if (s.type === "text/css" && (+s.getAttribute("data-priority")) > priority) {
            before = s;
	    }
	}

	head.insertBefore(styleElement, before);
	return function() {
		head.removeChild(styleElement);
	};
}
