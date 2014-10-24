/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");
module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
	this.cacheable && this.cacheable();
	var requestURI =
		this.options.output.publicPath +
		path.relative(this.options.output.path, remainingRequest);
	return [
		"// style-loader: Adds some reference to a css file to the DOM by adding a <link> tag",
		"var update = require(" + JSON.stringify(require.resolve("./addStyleUrl.js")) + ")(",
		"\t" + JSON.stringify(requestURI),
		");",
		"// Hot Module Replacement",
		"if(module.hot) {",
		"\tmodule.hot.accept(" + JSON.stringify("!!" + remainingRequest) + ", function() {",
		"\t\tupdate(" + JSON.stringify(requestURI) + ");",
		"\t});",
		"\tmodule.hot.dispose(function() { update(); });",
		"}"
	].join("\n");
};
