/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");
module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
	this.cacheable && this.cacheable();
	var comment1 = "// style-loader: Adds some css to the DOM by adding a <style> tag";
	var addStyleCode = "var addStyle = require(" + JSON.stringify("!" + path.join(__dirname, "addStyle.js")) + ")";
	var comment2 = "// The css code:";
	var cssCodeRequest = "require(" + JSON.stringify("!!" + remainingRequest) + ")";
	return [
		comment1,
		addStyleCode,
		"if(module.hot) {",
		"\tmodule.hot.accept();",
		"\tmodule.hot.dispose(",
		"\t\taddStyle(",
		"\t\t\t" + comment2,
		"\t\t\t" + cssCodeRequest + ",",
		"\t\t\t//keep link tag position",
		"\t\t\tmodule.hot.data && module.hot.data.nextEl",
		"\t\t)",
		"\t)",
		"} else {",
		"\taddStyle(",
		"\t\t" + comment2,
		"\t\t" + cssCodeRequest,
		"\t)",
		"}"
	].join('\n');
};
