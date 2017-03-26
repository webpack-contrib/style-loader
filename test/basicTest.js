// Node v4 requires "use strict" to allow block scoped let & const
"use strict";

describe("basic tests", function() {
  var path = require("path");

  var utils = require("./utils"),
    runCompilerTest = utils.runCompilerTest;

  var fs;

  var requiredCss = ".required { color: blue }",
    requiredCssTwo = ".requiredTwo { color: cyan }",
    localScopedCss = ":local(.className) { background: red; }",
    requiredStyle = `<style type="text/css">${requiredCss}</style>`,
    existingStyle = "<style>.existing { color: yellow }</style>",
    checkValue = '<div class="check">check</div>',
    rootDir = path.resolve(__dirname + "/../") + "/",
    jsdomHtml = [
      "<html>",
      "<head>",
      existingStyle,
      "</head>",
      "<body>",
      "<div class='target'>",
      checkValue,
      "</div>",
      "</body>",
      "</html>"
    ].join("\n");

  var styleLoaderOptions = {};
  var cssRule = {};

  var defaultCssRule = {
    test: /\.css?$/,
    use: [
      {
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
    }
  };

  beforeEach(function() {
    // Reset all style-loader options
    for (var member in styleLoaderOptions) {
      delete styleLoaderOptions[member];
    }

    for (var member in defaultCssRule) {
      cssRule[member] = defaultCssRule[member];
    }

    fs = utils.setup(webpackConfig, jsdomHtml);

    // Create a tiny file system. rootDir is used because loaders are refering to absolute paths.
    fs.mkdirpSync(rootDir);
    fs.writeFileSync(rootDir + "main.js", "var css = require('./style.css');");
    fs.writeFileSync(rootDir + "style.css", requiredCss);
    fs.writeFileSync(rootDir + "styleTwo.css", requiredCssTwo);
    fs.writeFileSync(rootDir + "localScoped.css", localScopedCss);
  }); // before each

  it("insert at bottom", function(done) {
    let expected = [existingStyle, requiredStyle].join("\n");

    runCompilerTest(expected, done);
  }); // it insert at bottom

  it("insert at top", function(done) {
    styleLoaderOptions.insertAt = "top";

    let expected = [requiredStyle, existingStyle].join("\n");

    runCompilerTest(expected, done);
  }); // it insert at top

  it("insert into", function(done) {
    let selector = "div.target";
    styleLoaderOptions.insertInto = selector;

    let expected = [checkValue, requiredStyle].join("\n");

    runCompilerTest(expected, done, undefined, selector);
  }); // it insert into

  it("singleton", function(done) {
    // Setup
    styleLoaderOptions.singleton = true;

    fs.writeFileSync(
      rootDir + "main.js",
      [
        "var a = require('./style.css');",
        "var b = require('./styleTwo.css');"
      ].join("\n")
    );

    // Run
    let expected = [
      existingStyle,
      `<style type="text/css">${requiredCss}${requiredCssTwo}</style>`
    ].join("\n");

    runCompilerTest(expected, done);
  }); // it singleton

  it("attrs", function(done) {
    // Setup
    styleLoaderOptions.attrs = {id: 'style-tag-id'};

    fs.writeFileSync(
      rootDir + "main.js",
      [
        "var a = require('./style.css');"
      ].join("\n")
    );

    // Run
    let expected = [
      existingStyle,
      `<style id="${styleLoaderOptions.attrs.id}" type="text/css">${requiredCss}</style>`
    ].join("\n");

    runCompilerTest(expected, done);
  }); // it attrs

  it("url", function(done) {
    cssRule.use = [
      {
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

  it("url with attrs", function (done) {
    cssRule.use = [
      {
        loader: "style-loader/url",
        options: {
          attrs: {
            'data-attr-1': 'attr-value-1',
            'data-attr-2': 'attr-value-2'
          }
        }
      },
      "file-loader"
    ];

    // Run
    let expected = [
      existingStyle,
      '<link rel="stylesheet" type="text/css" href="ec9d4f4f24028c3d51bf1e7728e632ff.css" data-attr-1="attr-value-1" data-attr-2="attr-value-2">'
    ].join("\n");

    runCompilerTest(expected, done);
  }); // it url with attrs

  it("useable", function(done) {
    cssRule.use = [
      {
        loader: "style-loader/useable"
      },
      "css-loader"
    ];

    fs.writeFileSync(
      rootDir + "main.js",
      [
        "var css = require('./style.css');",
        "var cssTwo = require('./styleTwo.css');",
        "css.use();",
        "cssTwo.use();",
        "css.unuse();"
      ].join("\n")
    );

    // Run
    let expected = [
      existingStyle,
      `<style type="text/css">${requiredCssTwo}</style>`
    ].join("\n");

    runCompilerTest(expected, done);
  }); // it useable

  it("useable without negative refs", function(done) {
    cssRule.use = [
      {
        loader: "style-loader/useable"
      },
      "css-loader"
    ];

    fs.writeFileSync(
      rootDir + "main.js",
      [
        "var css = require('./style.css');",
        "css.unuse();", // ref still 0
        "css.use();",  // ref 1
      ].join("\n")
    );

    // Run
    let expected = [
      existingStyle,
      `<style type="text/css">${requiredCss}</style>`
    ].join("\n");

    runCompilerTest(expected, done);
  }); // it useable

  it("local scope", function(done) {
    cssRule.use = [
      {
        loader: "style-loader"
      },
      {
        loader: "css-loader",
        options: { 
          localIdentName: '[name].[local]_[hash:base64:7]'
        }
      }
    ];

    fs.writeFileSync(
      rootDir + "main.js",
      [
        "css = require('./localScoped.css');"
      ].join("\n")
    );

    let expected = 'localScoped-className_3dIU6Uf';
    runCompilerTest(expected, done, function() { return this.css.className; });
  }); // it local scope

  it("local scope, useable", function(done) {
    cssRule.use = [
      {
        loader: "style-loader/useable"
      },
      {
        loader: "css-loader",
        options: { 
          localIdentName: '[name].[local]_[hash:base64:7]'
        }
      }
    ];

    fs.writeFileSync(
      rootDir + "main.js",
      [
        "css = require('./localScoped.css');"
      ].join("\n")
    );

    let expected = 'localScoped-className_3dIU6Uf';
    runCompilerTest(expected, done, function() { return this.css.locals.className; });
  }); // it local scope

}); // describe
