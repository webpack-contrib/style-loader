/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author KonstantinKai @kos9k
*/

'use strict';
var loaderUtils = require('loader-utils');

module.exports = function (loaderContext, attrs) {
	function parseAttrs (attr) {
		attr = attr.replace(/\\:/g, '__colon__');

		var parts = attr.split(':');
		parts[1] = loaderUtils.interpolateName(loaderContext, (parts[1] = parts[1].replace('__colon__', ':')), {});
		
		return parts;
	}

	var preparedAttrs = [];

	if (Array.isArray(attrs)) {
		for (var i = attrs.length; i--;) {
			preparedAttrs.push(parseAttrs(attrs[i]));
		}
	} else {
		preparedAttrs.push(parseAttrs(attrs));
	}

	return preparedAttrs;
};