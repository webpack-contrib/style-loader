/* eslint-disable */
import path from 'path';
import schema from './options.json';
import { getOptions, stringifyRequest } from 'loader-utils';
import validateOptions from 'schema-utils';

export default function loader() {}

export function pitch (request) {
  const options = Object.assign(
    {},
    getOptions(this)
  );

  validateOptions(schema, options, 'Style Loader (URL)');

  // TODO(michael-ciniawsky) webpack >= v4.0.0
  // remove options.hmr in favor of this.hot
  options.hmr = this.hot || typeof options.hmr === 'undefined' 
    ? true 
    : options.hmr;

  const hmr = [
    '// Hot Module Replacement',
    'if (module.hot) {',
    `  module.hot.accept(${stringifyRequest(this, `!!${request}`)}, () => {`,
    `    link(require(${stringifyRequest(this, `!!${request}`)}));`,
    '  });',
    '',
    '  module.hot.dispose(() => link());',
    '}',
  ].join('\n');

  return [
    '// Style Loader',
    '// Adds CSS to the DOM by adding a <link> tag',
    `import link from ${stringifyRequest(this, `!${path.join(__dirname, 'lib/url/index.js')}`)};`,
    `import href from ${stringifyRequest(this, `!!${request}`)};`,
    '',
    `link(href, ${JSON.stringify(options)});`,
    '',
    options.hmr ? hmr : '',
  ].join('\n');
}
