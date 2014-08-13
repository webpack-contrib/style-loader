/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");
module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
	this.cacheable && this.cacheable();
	var comment1 = "// style-loader: Adds some css to the DOM by adding a <style> tag\n";
	var addStyleCode = "var dispose = require(" + JSON.stringify("!" + path.join(__dirname, "addStyleUrl.js")) + ")\n";
	var comment2 = "\t// The url to the css code:\n";
	var cssUrlRequest = "require(" + JSON.stringify("!!" + remainingRequest) + ")";
	var comment3 = "// Hot Module Replacement\n";
	var hmrCode = "if(module.hot) {\n\tmodule.hot.accept();\n\tmodule.hot.dispose(dispose);\n}";
	return comment1 + addStyleCode + comment2 + "\t(" + cssUrlRequest + ", module.hot && module.hot.data && module.hot.data.nextEl);\n" + comment3 + hmrCode;
};
