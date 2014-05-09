/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");
var utils = require("loader-utils");
module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
	this.cacheable && this.cacheable();
	var opts = utils.parseQuery(this.query);
	var priority = +opts.priority || 0;

	return [
		"var refs = 0;",
		"var dispose;",
		"exports.use = exports.ref = function() {",
		"	if(!(refs++)) {",
		"		dispose = require(" + JSON.stringify("!" + path.join(__dirname, "addStyle.js")) + ")(require(" + JSON.stringify("!!" + remainingRequest) + "), " + JSON.stringify(priority) + ");",
		"	}",
		"	return exports",
		"};",
		"exports.unuse = exports.unref = function() {",
		"	if(!(--refs)) {",
		"		dispose();",
		"		dispose = null;",
		"	}",
		"};",
		"if(module.hot) {",
		"	refs = module.hot.data && module.hot.data.refs || 0;",
		"	if(refs) {",
		"		refs--;",
		"		exports.ref();",
		"	}",
		"	module.hot.accept();",
		"	module.hot.dispose(function(data) {",
		"		data.refs = refs;",
		"		if(dispose) {",
		"			dispose();",
		"		}",
		"	});",
		"}",
	].join("\n");
};
