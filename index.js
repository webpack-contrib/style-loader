/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var path = require("path");

module.exports = function() {};

module.exports.pitch = function(remainingRequest) {
	this.cacheable && this.cacheable();
	
	return [
		'// style-loader: Adds some css to the DOM by adding a <style> tag',
		'',
		'var css = require(' + JSON.stringify('!!' + remainingRequest) + ');',
		'var dispose = require(' + JSON.stringify('!' + path.join(__dirname, 'addStyle.js')) + ')(css);',
		'',
		'if (module.hot) {',
		'  module.hot.accept(' + JSON.stringify('!!' + remainingRequest) + ');',
		'  module.hot.dispose(dispose);',
		'}',
	].join('\n');
};
