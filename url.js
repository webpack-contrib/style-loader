/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");
module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
	this.cacheable && this.cacheable();
	var comment1 = "// style-loader: Adds some css to the DOM by adding a <link> tag";
	var addStyleCode = "var addStyleUrl = require(" + JSON.stringify("!" + path.join(__dirname, "addStyleUrl.js")) + ");";
	var comment2 = "// The url to the css code";
	var cssUrlRequest = "require(" + JSON.stringify("!!" + remainingRequest) + ")";
	return [
		comment1,
		addStyleCode,
		"if(module.hot) {",
		"\tmodule.hot.accept();",
		"\tmodule.hot.dispose(",
		"\t\taddStyleUrl(",
		"\t\t\t" + comment2,
		"\t\t\t" + cssUrlRequest + ",",
		"\t\t\t//keep link tag position",
		"\t\t\tmodule.hot.data && module.hot.data.nextEl",
		"\t\t)",
		"\t)",
		"} else {",
		"\taddStyleUrl(",
		"\t\t" + comment2,
		"\t\t" + cssUrlRequest,
		"\t)",
		"}"
	].join('\n');
};
