/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require("path");
module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
	this.cacheable && this.cacheable();
	return [
		"var refs = 0;",
		"var nextRefs = null;",
		"var dispose;",
		"exports.use = exports.ref = function() {",
		"	if(!(refs++)) {",
		"		var content = require(" + JSON.stringify("!!" + remainingRequest) + ")",
		"		if(typeof content === 'string') content = [[module.id, content, '']];",
		"		dispose = require(" + JSON.stringify("!" + path.join(__dirname, "addStyles.js")) + ")(content);",
		"	}",
		"	if(nextRefs !== null) {",
		"		refs = nextRefs;",
		"		nextRefs = null;",
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
		"		nextRefs = refs;",
		"		refs = 0;",
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
