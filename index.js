/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var path = require("path");

var loaderUtils = require("loader-utils");
var validateOptions = require('schema-utils');

module.exports = function () {};

module.exports.pitch = function (request) {
	if (this.cacheable) this.cacheable();

	var options = loaderUtils.getOptions(this) || {};

	validateOptions(require('./options.json'), options, 'Style Loader')

	options.hmr = typeof options.hmr === 'undefined' ? true : options.hmr;

	var hmrCode = [
		"// Hot Module Replacement",
		"if(module.hot) {",
		"	// When the styles change, update the <style> tags",
		"	module.hot.accept(" + loaderUtils.stringifyRequest(this, "!!" + request) + ", function() {",
		"		var newContent = require(" + loaderUtils.stringifyRequest(this, "!!" + request) + ");",
		"		if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];",
		"		var localsSame = true;",
		"		if(!content.locals && newContent.locals) {",
		"			localsSame = false;",
		"		} else if(content.locals && !newContent.locals) {",
		"			localsSame = false;",
		"		} else if(content.locals && newContent.locals) {",
		"			var oldKeys = Object.keys(content.locals);",
		"			var newKeys = Object.keys(newContent.locals);",
		"			if(oldKeys.length !== newKeys.length) {",
		"				localsSame = false;",
		"			} else {",
		"				localsSame = oldKeys.every(function(key) {",
		"					return content.locals[key] === newContent.locals[key];",
		"				});",
		"			}",
		"		}",
		"		// This error is caught and not shown and causes a full reload.",
		"		if(!localsSame) throw new Error('Aborting CSS HMR due to changed css-modules locals.')",
		"		update(newContent);",
		"	});",
		"	// When the module is disposed, remove the <style> tags",
		"	module.hot.dispose(function() { update(); });",
		"}"
	].join("\n");

	return [
		"// style-loader: Adds some css to the DOM by adding a <style> tag",
		"",
		"// load the styles",
		"var content = require(" + loaderUtils.stringifyRequest(this, "!!" + request) + ");",
		"if(typeof content === 'string') content = [[module.id, content, '']];",
		"// Prepare cssTransformation",
		"var transform;",
		options.transform ? "transform = require(" + loaderUtils.stringifyRequest(this, "!" + path.resolve(options.transform)) + ");" : "",
		"var options = " + JSON.stringify(options),
		"options.transform = transform",
		"// add the styles to the DOM",
		"var update = require(" + loaderUtils.stringifyRequest(this, "!" + path.join(__dirname, "lib", "addStyles.js")) + ")(content, options);",
		"if(content.locals) module.exports = content.locals;",
		options.hmr ? hmrCode : ""
	].join("\n");
};
