/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var loaderUtils = require("loader-utils"),
	path = require("path");
module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
	if(this.cacheable) this.cacheable();
	var query = loaderUtils.parseQuery(this.query);

	var importJs;
	var loaders = remainingRequest.split('!');
	if (loaders[0].indexOf('/css-loader/index.js') != -1) {
		importJs = "import { $css } from " + loaderUtils.stringifyRequest(this, "!!" + remainingRequest) + ";\n" +
			"export * from " + loaderUtils.stringifyRequest(this, "!!" + remainingRequest) + ";\n" +
			"export { default } from " + loaderUtils.stringifyRequest(this, "!!" + remainingRequest) + ";\n";
	} else {
		importJs = "var $css = {\n" +
			"\t id: module.id,\n" + 
			"\t content: require(" + loaderUtils.stringifyRequest(this, "!!" + remainingRequest) + "),\n" +
			"\t mediaQueries: []\n" +
			"};\n";
	}
	return [
		"// style-loader: Adds some css to the DOM by adding a <style> tag",
		// TODO: Update HMR
		"var content = { locals: true };",
		"// load the styles",
		importJs,
		"// add the styles to the DOM",
		"var update = require(" + loaderUtils.stringifyRequest(this, "!" + path.join(__dirname, "addStyles.js")) + ")($css, " + JSON.stringify(query) + ");",
		"// Hot Module Replacement",
		"if(module.hot) {",
		"	// When the styles change, update the <style> tags",
		"	if(!content.locals) {",
		"		module.hot.accept(" + loaderUtils.stringifyRequest(this, "!!" + remainingRequest) + ", function() {",
		"			var newContent = require(" + loaderUtils.stringifyRequest(this, "!!" + remainingRequest) + ");",
		"			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];",
		"			update(newContent);",
		"		});",
		"	}",
		"	// When the module is disposed, remove the <style> tags",
		"	module.hot.dispose(function() { update(); });",
		"}"
	].join("\n");
};
