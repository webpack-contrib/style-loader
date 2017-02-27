describe("basic tests", function() {
  var MemoryFS = require("memory-fs");
  var realFs = require("fs");
  var webpack = require("webpack");
  var path = require("path");
  var jsdom = require("jsdom");

  var assert = require("assert");

  var styleLoaderOptions = {};
  var cssRule = {};

  var defaultCssRule = {
    test: /\.css?$/,
    use: [{
        loader: "style-loader",
        options: styleLoaderOptions
      },
      "css-loader"
    ]
  };

  var webpackConfig = {
    entry: "./main.js",
    output: {
      filename: "bundle.js"
    },
    module: {
      rules: [cssRule]
    },
    resolveLoader: {
      alias: {
        "style-loader": path.resolve(__dirname, "../")
      }
    }
  };

  var fs;
  var compiler;

  var requiredCss = ".required { color: blue }",
    requiredCssTwo = ".requiredTwo { color: cyan }",
    requiredStyle = `<style type="text/css">${requiredCss}</style>`,
    existingStyle = "<style>.existing { color: yellow }</style>",
    rootDir = path.resolve(__dirname + '/../') + '/';

  beforeEach(function() {
    fs = new MemoryFS();

    // Reset all style-loader options
    for (var member in styleLoaderOptions) delete styleLoaderOptions[member];
    for (var member in defaultCssRule) cssRule[member] = defaultCssRule[member];
    compiler = webpack(webpackConfig);

    // Tell webpack to use our in-memory FS
    compiler.inputFileSystem = fs;
    compiler.outputFileSystem = fs;
    compiler.resolvers.normal.fileSystem = fs;
    compiler.resolvers.context.fileSystem = fs;

    ['readFileSync', 'statSync'].forEach((fn) => {
      // Preserve the reference to original function
      fs['mem' + fn] = fs[fn];

      compiler.inputFileSystem[fn] = function(_path) {
        // Only stub parts of the file system
        if (_path.search(/(main.js|style.css|styleTwo.css)$/) + 1) {
          return fs['mem' + fn](...arguments);
        } else {
          return realFs[fn](...arguments);
        }
      };
    })

    // Create a tiny file system. rootDir is used because loaders are refering to absolute paths.
    fs.mkdirpSync(rootDir);
    fs.writeFileSync(
      rootDir + "main.js",
      "var css = require('./style.css');"
    );
    fs.writeFileSync(rootDir + "style.css", requiredCss);
    fs.writeFileSync(rootDir + "styleTwo.css", requiredCssTwo);
  }); // before each

  function runCompilerTest(expected, done) {
    compiler.run(function(err, stats) {
      if (stats.compilation.errors.length) {
        throw new Error(stats.compilation.errors);
      }

      const bundleJs = stats.compilation.assets["bundle.js"].source();

      jsdom.env({
        html: [
          "<html>",
          "<head>",
          existingStyle,
          "</head>",
          "<body>",
          "</body>",
          "</html>"
        ].join("\n"),
        src: [bundleJs],
        done: function(err, window) {
          assert.equal(
            window.document.head.innerHTML.trim(),
            expected
          );
          // free memory associated with the window
          window.close();

          done();
        }
      });
    });
  }

  it("insert at bottom", function(done) {
    let expected = [existingStyle, requiredStyle].join("\n");

    runCompilerTest(expected, done);
  }); // it insert at bottom

  it("insert at top", function(done) {
    styleLoaderOptions.insertAt = "top";

    let expected = [requiredStyle, existingStyle].join("\n")

    runCompilerTest(expected, done);
  }); // it insert at top

  it("singleton", function(done) {
    // Setup
    styleLoaderOptions.singleton = true;

    fs.writeFileSync(rootDir + "main.js", [
      "var a = require('./style.css');",
      "var b = require('./styleTwo.css');"
    ].join("\n"));

    // Run
    let expected = [
      existingStyle,
      `<style type="text/css">${requiredCss}${requiredCssTwo}</style>`
    ].join("\n")

    runCompilerTest(expected, done);
  }); // it singleton

  it("url", function(done) {
    cssRule.use = [{
        loader: "style-loader/url",
        options: {}
      },
      "file-loader"
    ];

    // Run
    let expected = [
      existingStyle,
      '<link rel="stylesheet" type="text/css" href="ec9d4f4f24028c3d51bf1e7728e632ff.css">'
    ].join("\n");

    runCompilerTest(expected, done);
  }); // it url

  it("useable", function(done) {
    cssRule.use = [{
        loader: "style-loader/useable",
        options: {}
      },
      "css-loader"
    ];

    fs.writeFileSync(rootDir + "main.js", [
      "var css = require('./style.css');",
      "var cssTwo = require('./styleTwo.css');",
      "css.use();",
      "cssTwo.use();",
      "css.unuse();"
    ].join("\n"));

    // Run
    let expected = [
      existingStyle,
      `<style type="text/css">${requiredCssTwo}</style>`
    ].join("\n")

    runCompilerTest(expected, done);
  }); // it useable
}); // describe
