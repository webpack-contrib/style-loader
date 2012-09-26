/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");
module.exports = function(content) {
	this.cacheable && this.cacheable();
	this.clearDependencies && this.clearDependencies();
	if(this.loaderType != "loader") throw new Error("style-loader do not work as pre or post loader");
	var rawCss = this.currentLoaders.slice(this.loaderIndex+1).join("!") + "!" + this.filenames[0];
	if(this.web)
		return "require(" + JSON.stringify(path.join(__dirname, "addStyle")) + ")"+
				"(require(" + JSON.stringify(rawCss) + "))";
	return "";
}
module.exports.seperable = true;