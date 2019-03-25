"use strict";

var loaderUtils = require('loader-utils');

var useable = require("../useable");

describe("useable tests", function () {
  describe('insert into', function () {
    var path = require("path");

    var utils = require("./utils"),
      runCompilerTest = utils.runCompilerTest;

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
        "document.body.appendChild(el)",
        "var css = require('./style.css');",
        "css.use();",
      ].join("\n");

    var styleLoaderOptions = {};
    var cssRule = {};

    var defaultCssRule = {
      test: /\.css?$/,
      use: [
        {
          loader: "style-loader/useable",
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

    it("insert into iframe", function(done) {
      let selector = "iframe.iframeTarget";

      styleLoaderOptions.insertInto = selector;

      runCompilerTest(requiredStyle, done, function() {
        return this.document.querySelector(selector).contentDocument.head.innerHTML;
      }, selector);
    });
  });

  describe('hmr', function () {
    var getOptions;

    beforeEach(() => {
      getOptions = jest.fn();

      // Mock loaderUtils to override options
      loaderUtils.getOptions = getOptions;
    });

    it("should output HMR code by default", function () {
      expect(/(module\.hot)/g.test(useable.pitch())).toBe(true);
    });

    it("should NOT output HMR code when options.hmr is false", function () {
      getOptions.mockReturnValue({ hmr: false });

      expect(/(module\.hot)/g.test(useable.pitch())).toBe(false);
    });

    it("should output HMR code when options.hmr is true", function () {
      getOptions.mockReturnValue({ hmr: true });

      expect(/(module\.hot)/g.test(useable.pitch())).toBe(true);
    });
  });
});
