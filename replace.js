/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var loaderUtils = require("loader-utils"),
	path = require("path");
module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
	this.cacheable && this.cacheable();
	return [
		"// style-loader: Search for a css file reference in the DOM and replace the <link> href",
		"var update = require(" + JSON.stringify("!" + path.join(__dirname, "replaceStyleUrl.js")) + ")(",
		"\trequire(" + loaderUtils.stringifyRequest(this, "!!" + remainingRequest) + ")",
		");",
		"// Hot Module Replacement",
		"if(module.hot) {",
		"\tmodule.hot.accept(" + loaderUtils.stringifyRequest(this, "!!" + remainingRequest) + ", function() {",
		"\t\tupdate(require(" + loaderUtils.stringifyRequest(this, "!!" + remainingRequest) + "));",
		"\t});",
		"\tmodule.hot.dispose(function() { update(); });",
		"}"
	].join("\n");
};
