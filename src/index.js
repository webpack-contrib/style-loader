var path = require('path');

var loaderUtils = require('loader-utils');
var validateOptions = require('schema-utils');

module.exports = function () {};

module.exports.pitch = function (request) {
  if (this.cacheable) this.cacheable();

  var options = loaderUtils.getOptions(this) || {};

  validateOptions(require('./options.json'), options, 'Style Loader')

  options.hmr = typeof options.hmr === 'undefined' ? true : options.hmr;

  var hmr = [
    '// Hot Module Replacement',
    'if(module.hot) {',
    '  // When the styles change, update the <style> tags',
    '  if(!content.locals) {',
    '    module.hot.accept(' + loaderUtils.stringifyRequest(this, '!!' + request) + ', function() {',
    '      var newContent = require(' + loaderUtils.stringifyRequest(this, '!!' + request) + ');',
    '',
    '      if(typeof newContent === "string") {',
    '        newContent = [[module.id, newContent, ""]];',
    '      }',
    '',
    '      update(newContent);',
    '    });',
    '  }',
    '',
    '  // When the module is disposed, remove the <style> tags',
    '  module.hot.dispose(function() { update(); });',
    '}'
  ].join('\n');

  const code = [
    '// Style Loader',
    '// Adds some css to the DOM by adding a <style> tag',
    '',
    '// Load Styles',
    'var content = require(' + loaderUtils.stringifyRequest(this, '!!' + request) + ');',
    '',
    'if(typeof content === "string") content = [[module.id, content, ""]];',
    '',
    '// Prepare CSS Transformation',
    'var transform;',
    options.transform ? 'transform = require(' + loaderUtils.stringifyRequest(this, '!' + path.resolve(options.transform)) + ');' : '',
    'var options = ' + JSON.stringify(options),
    '',
    'options.transform = transform',
    '',
    '// Add the styles to the DOM',
    'var update = require(' + loaderUtils.stringifyRequest(this, '!' + path.join(__dirname, 'lib', 'index.js')) + ')(content, options);',
    'if(content.locals) module.exports = content.locals;',
    '',
    options.hmr ? hmr : ''
  ].join('\n');

  return code
};
