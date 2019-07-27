import path from 'path';

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json';

module.exports = () => {};

module.exports.pitch = function loader(request) {
  const options = loaderUtils.getOptions(this) || {};

  validateOptions(schema, options, 'Style Loader (URL)');

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
      `!${path.join(__dirname, 'runtime/addStyleUrl.js')}`
    )})(`,
    `  require(${loaderUtils.stringifyRequest(this, `!!${request}`)})`,
    `, ${JSON.stringify(options)});`,
    options.hmr ? hmr : '',
  ].join('\n');
};
