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
          return fs["mem" + fn](...arguments);
        } else {
          return realFs[fn](...arguments);
        }
      };
    });

    return fs;
  },
  runCompilerTest: function(expected, done) {
    compiler.run(function(err, stats) {
      if (stats.compilation.errors.length) {
        throw new Error(stats.compilation.errors);
      }

      const bundleJs = stats.compilation.assets["bundle.js"].source();

      jsdom.env({
        html: jsdomHtml,
        src: [bundleJs],
        done: function(err, window) {
          assert.equal(window.document.head.innerHTML.trim(), expected);
          // free memory associated with the window
          window.close();

          done();
        }
      });
    });
  }
};