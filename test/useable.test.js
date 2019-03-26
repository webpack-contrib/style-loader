const path = require('path');

const loaderUtils = require('loader-utils');

const useable = require('../useable');

const utils = require('./utils');

describe('useable tests', () => {
  describe('insert into', () => {
    const { runCompilerTest } = utils;

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
      fs = utils.setup(webpackConfig, jsdomHtml);

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
        if (Object.prototype.hasOwnProperty.call(styleLoaderOptions, member)) {
          delete styleLoaderOptions[member];
        }
      }

      for (const member in defaultCssRule) {
        if (Object.prototype.hasOwnProperty.call(defaultCssRule, member)) {
          cssRule[member] = defaultCssRule[member];
        }
      }

      setupWebpackConfig();
    });

    it('insert into iframe', (done) => {
      const selector = 'iframe.iframeTarget';

      styleLoaderOptions.insertInto = selector;

      runCompilerTest(
        requiredStyle,
        done,
        function test() {
          return this.document.querySelector(selector).contentDocument.head
            .innerHTML;
        },
        selector
      );
    });
  });

  describe('hmr', () => {
    let getOptions;

    beforeEach(() => {
      getOptions = jest.fn();

      // Mock loaderUtils to override options
      loaderUtils.getOptions = getOptions;
    });

    it('should output HMR code by default', () => {
      expect(/(module\.hot)/g.test(useable.pitch())).toBe(true);
    });

    it('should NOT output HMR code when options.hmr is false', () => {
      getOptions.mockReturnValue({ hmr: false });

      expect(/(module\.hot)/g.test(useable.pitch())).toBe(false);
    });

    it('should output HMR code when options.hmr is true', () => {
      getOptions.mockReturnValue({ hmr: true });

      expect(/(module\.hot)/g.test(useable.pitch())).toBe(true);
    });
  });
});
