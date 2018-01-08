/* eslint-disable */
import path from 'path';
import schema from './options.json';
import { getOptions, stringifyRequest } from 'loader-utils';
import validateOptions from 'schema-utils';

export default function loader () {};

export function pitch (request) {
  const options = Object.assign(
    {},
    getOptions(this)
  );

  validateOptions(schema, options, 'Style Loader');

  // TODO(webpack >= v4.0.0) remove options.hmr in favor of this.hot
  options.hmr = this.hot || typeof options.hmr === 'undefined' 
    ? true 
    : options.hmr;

  const hmr = [
    '// Hot Module Replacement',
    'if (module.hot) {',
    '  // When the styles change, update the <style> tags',
    `  module.hot.accept(${stringifyRequest(this, `!!${request}`)}, () => {`,
    '    // TODO update to ESM',
    `    let hot = require(${stringifyRequest(this, `!!${request}`)});`,
    '',
    '    if (typeof hot === "string") {',
    '      hot = [[module.id, hot, ""]];',
    '    }',
    '',
    '    style(hot);',
    '  });',
    '',
    '  // When the module is disposed, remove the <style> tags',
    '  module.hot.dispose(() => style());',
    '}',
  ].join('\n');

  return [
    '// Style Loader',
    '// Adds CSS to the DOM by adding a <style> tag',
    `import CSS from ${stringifyRequest(this, `!!${request}`)};`,
    `import style from ${stringifyRequest(this, `!${path.join(__dirname, 'lib/index.js')}`)};`,
    options.transform
      ? `import transform from ${stringifyRequest(this, `!${path.resolve(options.transform)}`)};`
      : '',
    '',
    '// CSS Exports',
    `export * from ${stringifyRequest(this, `!!${request}`)};`,
    '// CSS',
    'let css = CSS',
    '',
    '// Convert CSS',
    'if (typeof css === "string") {',
    '  css = [[module.id, css, ""]];',
    '}',
    '',
    '// Loader Options',
    `const options = ${JSON.stringify(options)}`,
    '',
    options.transform ? 'options.transform = transform' : '',
    '',
    '// Add Styles (DOM)',
    'const styles = style(css, options);',
    '',
    options.hmr ? hmr : '',
  ].join('\n');
}
