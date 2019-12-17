/* eslint-disable
  import/order,
  multiline-ternary,
  no-param-reassign,
*/
import del from 'del';
import path from 'path';
import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';

const module = (config) => {
  const shouldUseFileLoader =
    config.loader &&
    config.loader.options &&
    config.loader.options.injectType === 'linkTag';

  return {
    rules: config.rules
      ? config.rules
      : [
          {
            test: (config.loader && config.loader.test) || /\.css$/i,
            use: [
              {
                loader: path.join(__dirname, '../../src'),
                options: (config.loader && config.loader.options) || {},
              },
              shouldUseFileLoader
                ? {
                    loader: 'file-loader',
                    options:
                      (config.fileLoader && config.fileLoader.options) || {},
                  }
                : {
                    loader: 'css-loader',
                    options:
                      (config.cssLoader && config.cssLoader.options) || {},
                  },
            ],
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
    mode: config.mode || 'development',
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
    const outputFileSystem = createFsFromVolume(new Volume());
    // Todo remove when we drop webpack@4 support
    outputFileSystem.join = path.join.bind(path);

    compiler.outputFileSystem = outputFileSystem;
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
