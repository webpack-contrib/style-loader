import path from 'path';

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json';

module.exports = () => {};

module.exports.pitch = function loader(request) {
  const options = loaderUtils.getOptions(this) || {};

  validateOptions(schema, options, {
    name: 'Style Loader (URL)',
    baseDataPath: 'options',
  });

  const hmrCode = `
if (module.hot) {  
  module.hot.accept(
    ${loaderUtils.stringifyRequest(this, `!!${request}`)}, 
    function() {
      update(require(${loaderUtils.stringifyRequest(this, `!!${request}`)}));
    }
  );
    
  module.hot.dispose(function() { 
    update(); 
  });
}`;

  return `var update = require(${loaderUtils.stringifyRequest(
    this,
    `!${path.join(__dirname, 'runtime/addStyleUrl.js')}`
  )})(require(${loaderUtils.stringifyRequest(
    this,
    `!!${request}`
  )}), ${JSON.stringify(options)});
  ${this.hot ? hmrCode : ''}`;
};
