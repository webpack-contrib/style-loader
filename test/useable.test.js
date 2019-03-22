'use strict';

const assert = require('assert');
const sinon = require('sinon');
const loaderUtils = require('loader-utils');
const useable = require('../useable');

describe('useable tests', () => {
  describe('hmr', () => {
    const sandbox = sinon.sandbox.create();
    let getOptions;

    beforeEach(() => {
      // Mock loaderUtils to override options
      getOptions = sandbox.stub(loaderUtils, 'getOptions');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should output HMR code by default', () => {
      assert.equal(/(module\.hot)/g.test(useable.pitch()), true);
    });

    it('should NOT output HMR code when options.hmr is false', () => {
      getOptions.returns({ hmr: false });
      assert.equal(/(module\.hot)/g.test(useable.pitch()), false);
    });

    it('should output HMR code when options.hmr is true', () => {
      getOptions.returns({ hmr: true });
      assert.equal(/(module\.hot)/g.test(useable.pitch()), true);
    });
  });

  describe('insert into', () => {
    const path = require('path');
    const { setup, runCompilerTest } = require('./utils');

    let fs;

    const requiredCss = '.required { color: blue }';
    const requiredCssTwo = '.requiredTwo { color: cyan }';
    const localScopedCss = ':local(.className) { background: red; }';
    const localComposingCss = `
        :local(.composingClass) {
          composes: className from './localScoped.css';
          color: blue;
        }
      `;
    const requiredStyle = `<style type="text/css">${requiredCss}</style>`;
    const existingStyle = `<style id="existing-style">.existing { color: yellow }</style>`;
    const checkValue = '<div class="check">check</div>';
    const rootDir = `${path.resolve(`${__dirname}/../`)}/`;
    const jsdomHtml = [
      '<html>',
      "<head id='head'>",
      existingStyle,
      '</head>',
      '<body>',
      "<div class='target'>",
      checkValue,
      '</div>',
      "<iframe class='iframeTarget'/>",
      '</body>',
      '</html>',
    ].join('\n');
    const requiredJS = [
      "var el = document.createElement('div');",
      'el.id = "test-shadow";',
      'document.body.appendChild(el)',
      "var css = require('./style.css');",
      'css.use();',
    ].join('\n');

    const styleLoaderOptions = {};
    const cssRule = {};

    const defaultCssRule = {
      test: /\.css?$/,
      use: [
        {
          loader: 'style-loader/useable',
          options: styleLoaderOptions,
        },
        'css-loader',
      ],
    };

    const webpackConfig = {
      entry: './main.js',
      output: {
        filename: 'bundle.js',
      },
      module: {
        rules: [cssRule],
      },
    };

    const setupWebpackConfig = () => {
      fs = setup(webpackConfig, jsdomHtml);

      // Create a tiny file system. rootDir is used because loaders are referring to absolute paths.
      fs.mkdirpSync(rootDir);
      fs.writeFileSync(`${rootDir}main.js`, requiredJS);
      fs.writeFileSync(`${rootDir}style.css`, requiredCss);
      fs.writeFileSync(`${rootDir}styleTwo.css`, requiredCssTwo);
      fs.writeFileSync(`${rootDir}localScoped.css`, localScopedCss);
      fs.writeFileSync(`${rootDir}localComposing.css`, localComposingCss);
    };

    beforeEach(() => {
      // Reset all style-loader options
      for (const member in styleLoaderOptions) {
        delete styleLoaderOptions[member];
      }

      for (const member in defaultCssRule) {
        cssRule[member] = defaultCssRule[member];
      }

      setupWebpackConfig();
    }); // before each

    it('insert into iframe', (done) => {
      const selector = 'iframe.iframeTarget';
      styleLoaderOptions.insertInto = selector;

      const expected = requiredStyle;

      runCompilerTest(
        expected,
        done,
        function() {
          return this.window.document.querySelector(selector).contentDocument
            .head.innerHTML;
        },
        selector
      );
    }); // it insert into
  });
});
