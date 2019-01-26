/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require('path');

var loaderUtils = require("loader-utils");
var validateOptions = require('schema-utils');
var schema = require('./options.json');

var addStylesPath = path.join(__dirname, "lib", "addStyles.js");

module.exports = function () {};

module.exports.pitch = function (request) {
	if (this.cacheable) this.cacheable();

  var options = loaderUtils.getOptions(this);

	// The variable is needed, because the function should be inlined.
	// If is just stored it in options, JSON.stringify will quote
	// the function and it would be just a string at runtime
	var insertInto;

  if (options) {
    validateOptions(schema, options, 'Style Loader (Useable)');
    options.hmr = typeof options.hmr === 'undefined' ? true : options.hmr;

    var insertIntoType = typeof options.insertInto;
    if (insertIntoType === "function") {
      insertInto = options.insertInto.toString();
    }

    // We need to check if it a string, or variable will be "undefined"
    // and the loader crashes
    else if (insertIntoType === "string") {
      insertInto = '"' + options.insertInto + '"';
    }
  } else {
    options = { hmr: true };
  }

	var hmrStr = options.hmr ? [
		// Hot Module Replacement
		"if(module.hot) {",
		"	var lastRefs = module.hot.data && module.hot.data.refs || 0;",
		"",
		"	if(lastRefs) {",
		"		exports.ref();",
		"		if(!content.locals) {",
		"			refs = lastRefs;",
		"		}",
		"	}",
		"",
		"	if(!content.locals) {",
		"		module.hot.accept();",
		"	}",
		"",
		"	module.hot.dispose(function(data) {",
		"		data.refs = content.locals ? 0 : refs;",
		"",
		"		if(dispose) {",
		"			dispose();",
		"		}",
		"	});",
		"}"
	].join("\n") : "";

	return [
		"var refs = 0;",
		"var dispose;",
		"var content = require(" + loaderUtils.stringifyRequest(this, "!!" + request) + ");",
		"var options = " + JSON.stringify(options) + ";",
		"options.insertInto = " + insertInto + ";",
		"",
		"if(typeof content === 'string') content = [[module.id, content, '']];",
		// Export CSS Modules
		"if(content.locals) exports.locals = content.locals;",
		"",
		"exports.use = exports.ref = function() {",
		"	if(!(refs++)) {",
		"		dispose = require(" + loaderUtils.stringifyRequest(this, "!" + addStylesPath) + ")(content, options);",
		"	}",
		"",
		"	return exports;",
		"};",
		"",
		"exports.unuse = exports.unref = function() {",
		"  if(refs > 0 && !(--refs)) {",
		"	   dispose();",
		"		 dispose = null;",
		"  }",
		"};",
		hmrStr
	].join("\n");
};
