/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");
module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
	this.cacheable && this.cacheable();
	var cssCodeRequest = "require(" + JSON.stringify("!!" + remainingRequest) + ")";
	var addStyleCode = "require(" + JSON.stringify("!" + path.join(__dirname, "addStyle.js")) + ")";
	var footer = "";
	if(this.debug) {
		footer = "\n\n/* STYLE-LOADER FOOTER */\n/*@ sourceURL=style:///" +
				encodeURI(remainingRequest.replace(/^!/, "")).replace(/%5C|%2F/g, "/").replace(/\?/, "%3F").replace(/^\//, "") + " */";
		footer = "+" + JSON.stringify(footer);
	}
	return addStyleCode + "(" + cssCodeRequest + footer + ")";
};
module.exports.seperable = true;