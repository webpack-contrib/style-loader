/* global DEBUG */
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function getFileName(path) {
	if (typeof path !== "string") {
		return "";
	}

	var urlToFile = path.split("?")[0];
	return (urlToFile.match(/[^\\/]+\.[^\\/]+$/) || []).pop();
}

function replaceUrl(cssUrl, styleSheets) {
	for (var i = 0; i < styleSheets.length; i++) {
		var hrefFileName = getFileName(styleSheets[i].href);
		var urlFileName = getFileName(cssUrl);

		if (hrefFileName === urlFileName) {
			styleSheets[i].href = cssUrl;
		}
	}
}

function getStyleSheets() {
	var links = document.getElementsByTagName("link");
	var styleSheets = [];

	for (var i = 0; i < links.length; i++) {
		if (links[i].href && links[i].rel === "stylesheet") {
			styleSheets.push(links[i]);
		}
	}

	return styleSheets;
}

module.exports = function replaceStyleUrl(cssUrl) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") {
			throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	}

	var styleSheets = getStyleSheets();

	replaceUrl(cssUrl, styleSheets);

	if(module.hot) {
		return function(cssUrl) {
			if(typeof cssUrl === "string") {
				replaceUrl(cssUrl, styleSheets);
			}
		};
	}
};
