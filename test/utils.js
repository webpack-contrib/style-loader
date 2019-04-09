const realFs = require('fs');
const path = require('path');
const assert = require('assert');

const MemoryFS = require('memory-fs');
const webpack = require('webpack');
const jsdom = require('jsdom');

let compiler;
let jsdomHtml;

module.exports = {
  setup(webpackConfig, _jsdomHtml, config = {}) {
    const fs = new MemoryFS();

    jsdomHtml = _jsdomHtml;

    // Makes webpack resolve style-loader to local folder instead of node_modules
    Object.assign(webpackConfig, {
      mode: 'development',
      resolveLoader: {
        alias: {
          'style-loader': path.resolve(__dirname, '../'),
        },
      },
      plugins: [],
    });

    if (config.hmr) {
      webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    compiler = webpack(webpackConfig);

    // Tell webpack to use our in-memory FS
    compiler.inputFileSystem = fs;
    compiler.outputFileSystem = fs;
    compiler.resolvers.normal.fileSystem = fs;
    compiler.resolvers.context.fileSystem = fs;

    ['readFileSync', 'statSync'].forEach((fn) => {
      // Preserve the reference to original function
      fs[`mem${fn}`] = fs[fn];

      compiler.inputFileSystem[fn] = function inputFileSystem(_path) {
        // Fallback to real FS if file is not in the memoryFS
        if (fs.existsSync(_path)) {
          // eslint-disable-next-line prefer-spread, prefer-rest-params
          return fs[`mem${fn}`].apply(fs, arguments);
        }

        // eslint-disable-next-line prefer-spread, prefer-rest-params
        return realFs[fn].apply(realFs, arguments);
      };
    });

    return fs;
  },

  /*
   *  @param {string} expected - Expected value.
   *  @param {function} done - Async callback.
   *  @param {function} actual - Executed in the context of jsdom window, should return a string to compare to.
   */
  runCompilerTest(expected, done, actual, selector) {
    // eslint-disable-next-line no-param-reassign
    selector = selector || 'head';

    compiler.run((err, stats) => {
      if (stats.compilation.errors.length) {
        throw new Error(stats.compilation.errors);
      }

      const bundleJs = stats.compilation.assets['bundle.js'].source();
      const virtualConsole = new jsdom.VirtualConsole();

      virtualConsole.sendTo(console);

      try {
        const { window } = new jsdom.JSDOM(jsdomHtml, {
          resources: 'usable',
          runScripts: 'dangerously',
          virtualConsole,
        });
        // JSDom doesn't implement these.
        window.URL.createObjectURL = (arg) => `fakeJsdomObjectUrl(${arg})`;
        window.URL.revokeObjectURL = () => {};
        window.eval(bundleJs);

        if (typeof actual === 'function') {
          assert.equal(actual.apply(window), expected);
        } else {
          assert.equal(
            window.document.querySelector(selector).innerHTML.trim(),
            expected
          );
        }
        // free memory associated with the window
        window.close();

        done();
      } catch (e) {
        throw e;
      }
    });
  },

  /**
   * Runs the test against Webpack compiled source code
   *
   * @param {RegExp} match - regex to match the source code
   * @param {RegExp} noMatch - regex to NOT match the source code
   * @param {Function} done - Async callback
   */
  runSourceTest(match, noMatch, done) {
    compiler.run((err, stats) => {
      if (stats.compilation.errors.length) {
        throw new Error(stats.compilation.errors);
      }

      const source = stats.compilation.assets['bundle.js'].source();

      if (match) {
        assert.equal(match.test(source), true);
      }

      if (noMatch) {
        assert.equal(noMatch.test(source), false);
      }

      done();
    });
  },
};
