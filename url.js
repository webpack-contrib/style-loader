/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
const path = require('path');
const loaderUtils = require('loader-utils');
const validateOptions = require('schema-utils');

module.exports = function() {};

module.exports.pitch = function(request) {
  if (this.cacheable) this.cacheable();

  const options = loaderUtils.getOptions(this) || {};

  validateOptions(require('./options.json'), options, 'Style Loader (URL)');

  options.hmr = typeof options.hmr === 'undefined' ? true : options.hmr;

  const hmr = [
    // Hot Module Replacement
    'if(module.hot) {',
    `  module.hot.accept(${loaderUtils.stringifyRequest(
      this,
      `!!${request}`
    )}, function() {`,
    `    update(require(${loaderUtils.stringifyRequest(
      this,
      `!!${request}`
    )}));`,
    '  });',
    '',
    '  module.hot.dispose(function() { update(); });',
    '}',
  ].join('\n');

  return [
    // Adds some reference to a CSS file to the DOM by adding a <link> tag
    `var update = require(${loaderUtils.stringifyRequest(
      this,
      `!${path.join(__dirname, 'lib', 'addStyleUrl.js')}`
    )})(`,
    `  require(${loaderUtils.stringifyRequest(this, `!!${request}`)})`,
    `, ${JSON.stringify(options)});`,
    options.hmr ? hmr : '',
  ].join('\n');
};
