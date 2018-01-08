/* eslint-disable */
import path from 'path';
import schema from './options.json';
import { getOptions, stringifyRequest } from 'loader-utils';
import validateOptions from 'schema-utils';

export default function loader() {}

export function pitch(request) {
  const options = Object.assign(
    {},
    getOptions(this)
  );

  validateOptions(schema, options, 'Style Loader (Useable)');

  // TODO(michael-ciniawsky) webpack >= v4.0.0
  // remove options.hmr in favor of this.hot
  options.hmr = this.hot || typeof options.hmr === 'undefined' 
    ? true 
    : options.hmr;

  const hmr = [
    '// Hot Module Replacement',
    'if (module.hot) {',
    '  let lastRefs = module.hot.data && module.hot.data.refs || 0;',
    '',
    '  if (lastRefs) {',
    '    use();',
    '    // TODO revisit',
    '    if (!css) {',
    '      refs = lastRefs;',
    '    }',
    '  }',
    '  // TODO revisit',
    '  if (!css) {',
    '    module.hot.accept();',
    '  }',
    '',
    '  module.hot.dispose((data) => {',
    '    // TODO revisit',
    '    data.refs = css ? 0 : refs;',
    '',
    '    if (dispose) {',
    '      dispose();',
    '    }',
    '  });',
    '}',
  ].join('\n');

  return [
    '// Style Loader',
    '// Adds CSS to the DOM by lazy-loading them on demand',
    `import CSS from ${stringifyRequest(this, `!!${request}`)};`,
    `import runtime from ${stringifyRequest(this, `!${path.join(__dirname, 'lib/index.js')}`)};`,
    '',
    'let refs = 0;',
    'let dispose;',
    '',
    'let css = CSS',
    '',
    `if (typeof css === 'string') {`,
    `  css = [[module.id, css, '']];`,
    '}',
    '',
    `export * from ${stringifyRequest(this, `!!${request}`)};`,
    '',
    'export function use () {',
    '  if(!(refs++)) {',
    `    dispose = runtime(css, ${JSON.stringify(options)});`,
    '  }',
    '',
    '  return dispose;',
    '};',
    '',
    'export function unuse () {',
    '  if(refs > 0 && !(--refs)) {',
    '    dispose();',
    '',
    '    dispose = null;',
    '  }',
    '};',
    '',
    options.hmr ? hmr : ''
  ].join('\n');
}
