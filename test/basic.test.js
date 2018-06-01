// Node v4 requires "use strict" to allow block scoped let & const
"use strict";

describe("basic tests", function() {
  var path = require("path");

  var utils = require("./utils"),
    runCompilerTest = utils.runCompilerTest,
    runSourceTest = utils.runSourceTest;

  var fs;

  var requiredCss = ".required { color: blue }",
    requiredCssTwo = ".requiredTwo { color: cyan }",
    localScopedCss = ":local(.className) { background: red; }",
    localComposingCss = `
      :local(.composingClass) {
        composes: className from './localScoped.css';
        color: blue;
      }
    `,
    requiredStyle = `<style type="text/css">${requiredCss}</style>`,
    existingStyle = `<style id="existing-style">.existing { color: yellow }</style>`,
    checkValue = '<div class="check">check</div>',
    rootDir = path.resolve(__dirname + "/../") + "/",
    jsdomHtml = [
      "<html>",
      "<head id='head'>",
      existingStyle,
      "</head>",
      "<body>",
      "<div class='target'>",
      checkValue,
      "</div>",
      "<iframe class='iframeTarget'/>",
      "</body>",
      "</html>"
    ].join("\n"),
    requiredJS = [
      "var el = document.createElement('div');",
      "el.id = \"test-shadow\";",
      // "var shadow = el.attachShadow({ mode: 'open' })", // sadly shadow dom not working in jsdom
      "document.body.appendChild(el)",
      "var css = require('./style.css');",
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

  var setupWebpackConfig = function() {
    fs = utils.setup(webpackConfig, jsdomHtml);

    // Create a tiny file system. rootDir is used because loaders are referring to absolute paths.
    fs.mkdirpSync(rootDir);
    fs.writeFileSync(rootDir + "main.js", requiredJS);
    fs.writeFileSync(rootDir + "style.css", requiredCss);
    fs.writeFileSync(rootDir + "styleTwo.css", requiredCssTwo);
    fs.writeFileSync(rootDir + "localScoped.css", localScopedCss);
    fs.writeFileSync(rootDir + "localComposing.css", localComposingCss);
  };

  beforeEach(function() {
    // Reset all style-loader options
    for (var member in styleLoaderOptions) {
      delete styleLoaderOptions[member];
    }

    for (var member in defaultCssRule) {
      cssRule[member] = defaultCssRule[member];
    }

    setupWebpackConfig();
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

  it("insert at before", function(done) {
    styleLoaderOptions.insertAt = {
        before: "#existing-style"
    };

    let expected = [requiredStyle, existingStyle].join("");

    runCompilerTest(expected, done);
  }); // it insert at before

  it("insert at before invalid selector", function(done) {
    styleLoaderOptions.insertAt = {
        before: "#missing"
    };

    let expected = [existingStyle, requiredStyle].join("\n");

    runCompilerTest(expected, done);
  }); // it insert at before

  it("insert into", function(done) {
    let selector = "div.target";
    styleLoaderOptions.insertInto = selector;

    let expected = [checkValue, requiredStyle].join("\n");

    runCompilerTest(expected, done, undefined, selector);
  }); // it insert into

  it("insert into iframe", function(done) {
    let selector = "iframe.iframeTarget";
    styleLoaderOptions.insertInto = selector;

    let expected = requiredStyle;

    runCompilerTest(expected, done, function() {
      return this.document.querySelector(selector).contentDocument.head.innerHTML;
    }, selector);
  }); // it insert into

  it("insert into custom element by function", function(done) {
    const selector = "#test-shadow";
    styleLoaderOptions.insertInto = () => document.querySelector("#test-shadow");

    let expected = requiredStyle;

    runCompilerTest(expected, done, function() {
      return this.document.querySelector(selector).innerHTML;
    }, selector);
  });

  it("insert at before with insert into custom element by function", function(done) {
    const selector = "#head";
    styleLoaderOptions.insertInto = () => document.querySelector("#head");

    styleLoaderOptions.insertAt = {
        before: "#existing-style"
    };

    let expected = requiredCss;

    runCompilerTest(expected, done, function() {
      let head = this.document.querySelector(selector);
      let existingStyleIndex;
      for (let i = 0; i < head.children.length; i++){
        let html = `<style id="existing-style">${head.children[i].innerHTML}</style>`;
        if(html === existingStyle){
            existingStyleIndex = i;
            break;
        }
      }
      return head.children[existingStyleIndex - 1].innerHTML;
    }, selector);
  }); // it insert at before with insert into

  it("singleton (true)", function(done) {
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

  it("singleton (false)", function(done) {
    // Setup
    styleLoaderOptions.singleton = false;

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
      `<style type="text/css">${requiredCss}</style><style type="text/css">${requiredCssTwo}</style>`
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

  it("nonce", function(done) {
    // Setup
    const expectedNonce = "testNonce";

    fs.writeFileSync(
      rootDir + "main.js",
      [
        `__webpack_nonce__ = '${expectedNonce}'`,
        "var a = require('./style.css');"
      ].join("\n")
    );

    // Run
    let expected = [
      existingStyle,
      `<style type="text/css" nonce="${expectedNonce}">${requiredCss}</style>`
    ].join("\n");

    runCompilerTest(expected, done);
  }); // it attrs

  it("type attribute", function(done) {
    // Setup
    styleLoaderOptions.attrs = {type: 'text/less'};

    fs.writeFileSync(
      rootDir + "main.js",
      [
        "var a = require('./style.css');"
      ].join("\n")
    );

    // Run
    let expected = [
      existingStyle,
      `<style type="${styleLoaderOptions.attrs.type}">${requiredCss}</style>`
    ].join("\n");

    runCompilerTest(expected, done);
  }); // it type attribute

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

  it("url with type attribute", function (done) {
    cssRule.use = [
      {
        loader: "style-loader/url",
        options: {
          attrs: {
            type: 'text/less'
          }
        }
      },
      "file-loader"
    ];

    // Run
    let expected = [
      existingStyle,
      '<link rel="stylesheet" type="text/less" href="ec9d4f4f24028c3d51bf1e7728e632ff.css">'
    ].join("\n");

    runCompilerTest(expected, done);
  }); // it url with type attribute

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

  it("local scope, composing", function(done) {
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
        "css = require('./localComposing.css');"
      ].join("\n")
    );

    let expected =
      'localComposing-composingClass_3kXcqag localScoped-className_3dIU6Uf';
    runCompilerTest(expected, done, function() {
      return this.css.composingClass;
    });
  }); // it local scope, composing

  it("local scope, composing, custom getLocalIdent", function(done) {
    cssRule.use = [
      {
        loader: "style-loader"
      },
      {
        loader: "css-loader",
        options: {
          ident: 'css',
          localIdentName: '[name].[local]_[hash:base64:7]',
          getLocalIdent: (context, localIdentName, localName) => {
            return 'X' + localName;
          }
        }
      }
    ];

    fs.writeFileSync(
      rootDir + "main.js",
      [
        "css = require('./localComposing.css');"
      ].join("\n")
    );

    let expected =
      'XcomposingClass XclassName';
    runCompilerTest(expected, done, function() {
      return this.css.composingClass;
    });
  }); // it local scope, composing, custom getLocalIdent

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

  describe("transform function", function() {

    it("should not load the css if the transform function returns false", function(done) {
      styleLoaderOptions.transform = 'test/transforms/false';

      const expected = existingStyle;

      runCompilerTest(expected, done);
    });

    it("should not load the css if the transform function returns undefined", function(done) {
      styleLoaderOptions.transform = 'test/transforms/noop';

      const expected = existingStyle;

      runCompilerTest(expected, done);
    });

    it("should load the transformed css returned by the transform function", function(done) {
      const transform = require('./transforms/transform');
      styleLoaderOptions.transform = 'test/transforms/transform';

      const expectedTansformedStyle = transform(requiredStyle);
      const expected = [existingStyle, expectedTansformedStyle].join("\n");

      runCompilerTest(expected, done);
    });
  });

  describe("HMR", function() {
    it("should output HMR code block by default", function(done) {
      runSourceTest(/module\.hot/g, null, done);
    });

    it("should output HMR code block when options.hmr is true", function(done) {
      styleLoaderOptions.hmr = true;
      setupWebpackConfig();
      runSourceTest(/module\.hot/g, null, done);
    });

    it("should not output HMR code block when options.hmr is false", function(done) {
      styleLoaderOptions.hmr = false;
      setupWebpackConfig();
      runSourceTest(null, /module\.hot/g, done);
    });

  });

});
