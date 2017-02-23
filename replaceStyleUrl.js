/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function getFileName(str) {return (str.match(/[^\\/]+\.[^\\/]+$/) || []).pop()}

function replaceUrl(cssUrl, styleSheets) {
	for (var i = 0; i < styleSheets.length; i++) {
		var href = styleSheets[i].href.split("?")[0];
		var url = cssUrl.split("?")[0];

		var hrefFileName = getFileName(href);
		var urlFileName = getFileName(url);

		if (hrefFileName === urlFileName) {
			styleSheets[i].href = cssUrl;
		}
	}
}

module.exports = function replaceStyleUrl(cssUrl) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	var links = document.getElementsByTagName("link");
	var styleSheets = [];

	for (var i = 0; i < links.length; i++) {
		if (links[i].href && links[i].rel === "stylesheet") styleSheets.push(links[i]);
	}

	if (!styleSheets.length) return;

	replaceUrl(cssUrl, styleSheets);

	if(module.hot) {
		return function(cssUrl) {
			if(typeof cssUrl === "string") {
				replaceUrl(cssUrl, styleSheets);
			}
		};
	}
}
