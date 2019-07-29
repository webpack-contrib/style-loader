/* eslint-disable
  import/order,
  multiline-ternary,
  no-param-reassign,
*/
import del from 'del';
import path from 'path';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';

function getLoaderByInjectType(injectType) {
  // eslint-disable-next-line default-case
  switch (injectType) {
    case 'styleTag':
      return path.resolve(__dirname, '../../src');
    case 'useableStyleTag':
      return path.resolve(__dirname, '../../src/useable-loader.js');
    case 'linkTag':
      return path.resolve(__dirname, '../../src/url-loader.js');
  }

  return path.join(__dirname, '../../src');
}

function getUse(config) {
  const shouldUseFileLoader =
    config.loader &&
    config.loader.injectType &&
    config.loader.injectType === 'linkTag';

  return [
    {
      loader: getLoaderByInjectType(config.loader && config.loader.injectType),
      options: (config.loader && config.loader.options) || {},
    },
    shouldUseFileLoader ? { loader: 'file-loader' } : false,
    {
      loader: 'css-loader',
      options: (config.cssLoader && config.cssLoader.options) || {},
    },
  ].filter(Boolean);
}

const module = (config) => {
  return {
    rules: config.rules
      ? config.rules
      : [
          {
            test: (config.loader && config.loader.test) || /\.css$/i,
            use: getUse(config),
          },
        ],
  };
};

const plugins = (config) => [].concat(config.plugins || []);

const output = (config) => {
  return {
    path: path.resolve(
      __dirname,
      `../outputs/${config.output ? config.output : ''}`
    ),
    filename: '[name].bundle.js',
  };
};

export default function(fixture, config = {}, options = {}) {
  // webpack Config
  config = {
    mode: 'development',
    devtool: config.devtool || false,
    context: path.resolve(__dirname, '..', 'fixtures'),
    entry: `./${fixture}`,
    output: output(config),
    module: module(config),
    plugins: plugins(config),
    optimization: {
      runtimeChunk: false,
    },
  };
  // Compiler Options
  options = Object.assign({ output: false }, options);

  if (options.output) {
    del.sync(config.output.path);
  }

  const compiler = webpack(config);

  if (!options.output) {
    compiler.outputFileSystem = new MemoryFS();
  }

  return new Promise((resolve, reject) =>
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      return resolve(stats);
    })
  );
}
