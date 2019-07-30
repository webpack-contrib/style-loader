import path from 'path';

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';

import schema from './options.json';

module.exports = () => {};

module.exports.pitch = function loader(request) {
  const options = loaderUtils.getOptions(this) || {};

  validateOptions(schema, options, {
    name: 'Style Loader (Useable)',
    baseDataPath: 'options',
  });

  // The variable is needed, because the function should be inlined.
  // If is just stored it in options, JSON.stringify will quote
  // the function and it would be just a string at runtime
  let insertInto;

  if (typeof options.insertInto === 'function') {
    insertInto = options.insertInto.toString();
  }

  // We need to check if it a string, or variable will be "undefined"
  // and the loader crashes
  if (typeof options.insertInto === 'string') {
    insertInto = `"${options.insertInto}"`;
  }

  const hmr = [
    // Hot Module Replacement
    'if(module.hot) {',
    '	var lastRefs = module.hot.data && module.hot.data.refs || 0;',
    '',
    '	if(lastRefs) {',
    '		exports.ref();',
    '		if(!content.locals) {',
    '			refs = lastRefs;',
    '		}',
    '	}',
    '',
    '	if(!content.locals) {',
    '		module.hot.accept();',
    '	}',
    '',
    '	module.hot.dispose(function(data) {',
    '		data.refs = content.locals ? 0 : refs;',
    '',
    '		if(dispose) {',
    '			dispose();',
    '		}',
    '	});',
    '}',
  ].join('\n');

  return [
    'var refs = 0;',
    'var dispose;',
    `var content = require(${loaderUtils.stringifyRequest(
      this,
      `!!${request}`
    )});`,
    `var options = ${JSON.stringify(options)};`,
    `options.insertInto = ${insertInto};`,
    '',
    "if(typeof content === 'string') content = [[module.id, content, '']];",
    // Export CSS Modules
    'if(content.locals) exports.locals = content.locals;',
    '',
    'exports.use = exports.ref = function() {',
    'if(!(refs++)) {',
    `  dispose = require(${loaderUtils.stringifyRequest(
      this,
      `!${path.join(__dirname, 'runtime/addStyles.js')}`
    )})(content, options);`,
    '}',
    '',
    ' return exports;',
    '};',
    '',
    'exports.unuse = exports.unref = function() {',
    '  if(refs > 0 && !(--refs)) {',
    '    dispose();',
    '    dispose = null;',
    '  }',
    '};',
    this.hot ? hmr : '',
  ].join('\n');
};
