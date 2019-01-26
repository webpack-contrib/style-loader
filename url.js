/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require('path');

var loaderUtils = require('loader-utils');
var validateOptions = require('schema-utils');
var schema = require('./options.json');

var addStyleUrlPath = path.join(__dirname, "lib", "addStyleUrl.js");

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
		"  module.hot.accept(" + loaderUtils.stringifyRequest(this, "!!" + request) + ", function() {",
		"    update(require(" + loaderUtils.stringifyRequest(this, "!!" + request) + "));",
		"  });",
		"",
		"  module.hot.dispose(function() { update(); });",
		"}"
	].join("\n") : "";

	return [
		// Adds some reference to a CSS file to the DOM by adding a <link> tag
		"var update = require(" + loaderUtils.stringifyRequest(this, "!" + addStyleUrlPath) + ")(",
		"  require(" + loaderUtils.stringifyRequest(this, "!!" + request) + ")",
		", " + JSON.stringify(options) + ");",
		hmrStr
	].join("\n");
};
