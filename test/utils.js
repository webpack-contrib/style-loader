// Node v4 requires "use strict" to allow block scoped let & const
"use strict";

var MemoryFS = require("memory-fs");
var realFs = require("fs");
var webpack = require("webpack");
var path = require("path");
var jsdom = require("jsdom");

var assert = require("assert");

var compiler;
var jsdomHtml;

module.exports = {
  setup: function(webpackConfig, _jsdomHtml) {
    let fs = new MemoryFS();

    jsdomHtml = _jsdomHtml;

    // Makes webpack resolve style-loader to local folder instead of node_modules
    Object.assign(webpackConfig, {
      resolveLoader: {
        alias: {
          "style-loader": path.resolve(__dirname, "../")
        }
      }
    });

    compiler = webpack(webpackConfig);

    // Tell webpack to use our in-memory FS
    compiler.inputFileSystem = fs;
    compiler.outputFileSystem = fs;
    compiler.resolvers.normal.fileSystem = fs;
    compiler.resolvers.context.fileSystem = fs;

    ["readFileSync", "statSync"].forEach(fn => {
      // Preserve the reference to original function
      fs["mem" + fn] = fs[fn];

      compiler.inputFileSystem[fn] = function(_path) {
        // Fallback to real FS if file is not in the memoryFS
        if (fs.existsSync(_path)) {
          return fs["mem" + fn].apply(fs, arguments);
        } else {
          return realFs[fn].apply(realFs, arguments);
        }
      };
    });

    return fs;
  },

  /*
   *  @param {string} expected - Expected value.
   *  @param {function} done - Async callback from Mocha.
   *  @param {function} actual - Executed in the context of jsdom window, should return a string to compare to.
   */
  runCompilerTest: function(expected, done, actual) {
    compiler.run(function(err, stats) {
      if (stats.compilation.errors.length) {
        throw new Error(stats.compilation.errors);
      }

      const bundleJs = stats.compilation.assets["bundle.js"].source();

      jsdom.env({
        html: jsdomHtml,
        src: [bundleJs],
        virtualConsole: jsdom.createVirtualConsole().sendTo(console),
        done: function(err, window) {
          if (typeof actual === 'function') {
            assert.equal(actual.apply(window), expected);  
          } else {
            assert.equal(window.document.head.innerHTML.trim(), expected);
          }
          // free memory associated with the window
          window.close();

          done();
        }
      });
    });
  }
};