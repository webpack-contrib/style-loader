/* eslint-env browser */
const path = require('path');

const loaderUtils = require('loader-utils');

const url = require('../url');
const useable = require('../useable');

const utils = require('./utils');

describe('basic tests', () => {
  const { runCompilerTest } = utils;
  const { runSourceTest } = utils;

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
    // "var shadow = el.attachShadow({ mode: 'open' })", // sadly shadow dom not working in jsdom
    'document.body.appendChild(el)',
    "var css = require('./style.css');",
  ].join('\n');

  const styleLoaderOptions = {};
  const cssRule = {};

  const defaultCssRule = {
    test: /\.css?$/,
    use: [
      {
        loader: path.resolve(__dirname, '../src/index.js'),
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

  const setupWebpackConfig = (config) => {
    fs = utils.setup(webpackConfig, jsdomHtml, config);

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

  it('insert at bottom', (done) => {
    const expected = [existingStyle, requiredStyle].join('\n');

    runCompilerTest(expected, done);
  });

  it('insert at top', (done) => {
    styleLoaderOptions.insertAt = 'top';

    const expected = [requiredStyle, existingStyle].join('\n');

    runCompilerTest(expected, done);
  });

  it('insert at before', (done) => {
    styleLoaderOptions.insertAt = {
      before: '#existing-style',
    };

    const expected = [requiredStyle, existingStyle].join('');

    runCompilerTest(expected, done);
  });

  it('insert at before invalid selector', (done) => {
    styleLoaderOptions.insertAt = {
      before: '#missing',
    };

    const expected = [existingStyle, requiredStyle].join('\n');

    runCompilerTest(expected, done);
  });

  it('insert into', (done) => {
    const selector = 'div.target';
    styleLoaderOptions.insertInto = selector;

    const expected = [checkValue, requiredStyle].join('\n');

    // eslint-disable-next-line no-undefined
    runCompilerTest(expected, done, undefined, selector);
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

  it('insert into custom element by function', (done) => {
    const selector = '#test-shadow';

    styleLoaderOptions.insertInto = () =>
      document.querySelector('#test-shadow');

    runCompilerTest(
      requiredStyle,
      done,
      function test() {
        return this.document.querySelector(selector).innerHTML;
      },
      selector
    );
  });

  it('insert at before with insert into custom element by function', (done) => {
    const selector = '#head';

    styleLoaderOptions.insertInto = () => document.querySelector('#head');
    styleLoaderOptions.insertAt = {
      before: '#existing-style',
    };

    runCompilerTest(
      requiredCss,
      done,
      function test() {
        const head = this.document.querySelector(selector);
        let existingStyleIndex;

        for (let i = 0; i < head.children.length; i++) {
          const html = `<style id="existing-style">${head.children[i].innerHTML}</style>`;

          if (html === existingStyle) {
            existingStyleIndex = i;
            break;
          }
        }

        return head.children[existingStyleIndex - 1].innerHTML;
      },
      selector
    );
  });

  it('singleton (true)', (done) => {
    // Setup
    styleLoaderOptions.singleton = true;

    fs.writeFileSync(
      `${rootDir}main.js`,
      [
        "var a = require('./style.css');",
        "var b = require('./styleTwo.css');",
      ].join('\n')
    );

    // Run
    const expected = [
      existingStyle,
      `<style type="text/css">${requiredCss}${requiredCssTwo}</style>`,
    ].join('\n');

    runCompilerTest(expected, done);
  });

  it('singleton (false)', (done) => {
    // Setup
    styleLoaderOptions.singleton = false;

    fs.writeFileSync(
      `${rootDir}main.js`,
      [
        "var a = require('./style.css');",
        "var b = require('./styleTwo.css');",
      ].join('\n')
    );

    // Run
    const expected = [
      existingStyle,
      `<style type="text/css">${requiredCss}</style><style type="text/css">${requiredCssTwo}</style>`,
    ].join('\n');

    runCompilerTest(expected, done);
  });

  it('attributes', (done) => {
    // Setup
    styleLoaderOptions.attributes = { id: 'style-tag-id' };

    fs.writeFileSync(
      `${rootDir}main.js`,
      ["var a = require('./style.css');"].join('\n')
    );

    // Run
    const expected = [
      existingStyle,
      `<style id="${styleLoaderOptions.attributes.id}" type="text/css">${requiredCss}</style>`,
    ].join('\n');

    runCompilerTest(expected, done);
  });

  it('nonce', (done) => {
    // Setup
    const expectedNonce = 'testNonce';

    fs.writeFileSync(
      `${rootDir}main.js`,
      [
        `__webpack_nonce__ = '${expectedNonce}'`,
        "var a = require('./style.css');",
      ].join('\n')
    );

    // Run
    const expected = [
      existingStyle,
      `<style type="text/css" nonce="${expectedNonce}">${requiredCss}</style>`,
    ].join('\n');

    runCompilerTest(expected, done);
  });

  it('type attribute', (done) => {
    // Setup
    styleLoaderOptions.attributes = { type: 'text/less' };

    fs.writeFileSync(
      `${rootDir}main.js`,
      ["var a = require('./style.css');"].join('\n')
    );

    // Run
    const expected = [
      existingStyle,
      `<style type="${styleLoaderOptions.attributes.type}">${requiredCss}</style>`,
    ].join('\n');

    runCompilerTest(expected, done);
  });

  it('url', (done) => {
    cssRule.use = [
      {
        loader: path.resolve(__dirname, '../src/url-loader.js'),
        options: {},
      },
      'file-loader',
    ];

    // Run
    const expected = [
      existingStyle,
      '<link rel="stylesheet" type="text/css" href="ec9d4f4f24028c3d51bf1e7728e632ff.css">',
    ].join('\n');

    runCompilerTest(expected, done);
  });

  it('url with attributes', (done) => {
    cssRule.use = [
      {
        loader: path.resolve(__dirname, '../src/url-loader.js'),
        options: {
          attributes: {
            'data-attr-1': 'attr-value-1',
            'data-attr-2': 'attr-value-2',
          },
        },
      },
      'file-loader',
    ];

    // Run
    const expected = [
      existingStyle,
      '<link rel="stylesheet" type="text/css" href="ec9d4f4f24028c3d51bf1e7728e632ff.css" data-attr-1="attr-value-1" data-attr-2="attr-value-2">',
    ].join('\n');

    runCompilerTest(expected, done);
  });

  it('url with type attribute', (done) => {
    cssRule.use = [
      {
        loader: path.resolve(__dirname, '../src/url-loader.js'),
        options: {
          attributes: {
            type: 'text/less',
          },
        },
      },
      'file-loader',
    ];

    // Run
    const expected = [
      existingStyle,
      '<link rel="stylesheet" type="text/less" href="ec9d4f4f24028c3d51bf1e7728e632ff.css">',
    ].join('\n');

    runCompilerTest(expected, done);
  });

  it('useable', (done) => {
    cssRule.use = [
      {
        loader: path.resolve(__dirname, '../src/useable-loader.js'),
      },
      'css-loader',
    ];

    fs.writeFileSync(
      `${rootDir}main.js`,
      [
        "var css = require('./style.css');",
        "var cssTwo = require('./styleTwo.css');",
        'css.use();',
        'cssTwo.use();',
        'css.unuse();',
      ].join('\n')
    );

    // Run
    const expected = [
      existingStyle,
      `<style type="text/css">${requiredCssTwo}</style>`,
    ].join('\n');

    runCompilerTest(expected, done);
  });

  it('useable without negative refs', (done) => {
    cssRule.use = [
      {
        loader: path.resolve(__dirname, '../src/useable-loader.js'),
      },
      'css-loader',
    ];

    fs.writeFileSync(
      `${rootDir}main.js`,
      [
        "var css = require('./style.css');",
        // ref still 0
        'css.unuse();',
        // ref 1
        'css.use();',
      ].join('\n')
    );

    // Run
    const expected = [
      existingStyle,
      `<style type="text/css">${requiredCss}</style>`,
    ].join('\n');

    runCompilerTest(expected, done);
  });

  it('local scope', (done) => {
    cssRule.use = [
      {
        loader: path.join(__dirname, '../src/index.js'),
      },
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[name].[local]_[hash:base64:7]',
          },
        },
      },
    ];

    fs.writeFileSync(
      `${rootDir}main.js`,
      ["css = require('./localScoped.css');"].join('\n')
    );

    const expected = 'localScoped.className_3dIU6Uf';

    runCompilerTest(expected, done, function getClassName() {
      return this.css.className;
    });
  });

  it('local scope, composing', (done) => {
    cssRule.use = [
      {
        loader: path.resolve(__dirname, '../src/index.js'),
      },
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[name].[local]_[hash:base64:7]',
          },
        },
      },
    ];

    fs.writeFileSync(
      `${rootDir}main.js`,
      ["css = require('./localComposing.css');"].join('\n')
    );

    const expected =
      'localComposing.composingClass_3kXcqag localScoped.className_3dIU6Uf';

    runCompilerTest(expected, done, function getComposingClass() {
      return this.css.composingClass;
    });
  });

  it('local scope, composing, custom getLocalIdent', (done) => {
    cssRule.use = [
      {
        loader: path.resolve(__dirname, '../src/index.js'),
      },
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[name].[local]_[hash:base64:7]',
            getLocalIdent: (context, localIdentName, localName) =>
              `X${localName}`,
          },
        },
      },
    ];

    fs.writeFileSync(
      `${rootDir}main.js`,
      ["css = require('./localComposing.css');"].join('\n')
    );

    const expected = 'XcomposingClass XclassName';
    runCompilerTest(expected, done, function getComposingClass() {
      return this.css.composingClass;
    });
  });

  it('local scope, useable', (done) => {
    cssRule.use = [
      {
        loader: path.resolve(__dirname, '../src/useable-loader.js'),
      },
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[name].[local]_[hash:base64:7]',
          },
        },
      },
    ];

    fs.writeFileSync(
      `${rootDir}main.js`,
      ["css = require('./localScoped.css');"].join('\n')
    );

    const expected = 'localScoped.className_3dIU6Uf';

    runCompilerTest(expected, done, function getClassName() {
      return this.css.locals.className;
    });
  });

  describe('transform function', () => {
    it('should not load the css if the transform function returns false', (done) => {
      styleLoaderOptions.transform = 'test/transforms/false';

      runCompilerTest(existingStyle, done);
    });

    it('should not load the css if the transform function returns undefined', (done) => {
      styleLoaderOptions.transform = 'test/transforms/noop';

      runCompilerTest(existingStyle, done);
    });

    it('should load the transformed css returned by the transform function', (done) => {
      // eslint-disable-next-line global-require
      const transform = require('./transforms/transform');

      styleLoaderOptions.transform = 'test/transforms/transform';

      const expectedTansformedStyle = transform(requiredStyle);
      const expected = [existingStyle, expectedTansformedStyle].join('\n');

      runCompilerTest(expected, done);
    });

    it('es6 export: should throw error transform is not a function', (done) => {
      // eslint-disable-next-line global-require
      const transform = require('./transforms/transform_es6');

      styleLoaderOptions.transform = 'test/transforms/transform_es6';

      // const expectedTansformedStyle = transform(requiredStyle);
      const expected = new TypeError('transform is not a function').message;

      // eslint-disable-next-line consistent-return
      runCompilerTest(expected, done, () => {
        try {
          transform(requiredStyle);
        } catch (error) {
          return error.message;
        }
      });
    });

    it('es6 export: should not throw any error', (done) => {
      // eslint-disable-next-line global-require
      const transform = require('./transforms/transform_es6');

      styleLoaderOptions.transform = 'test/transforms/transform_es6';

      const expectedTansformedStyle = transform[Object.keys(transform)[0]](
        requiredStyle
      );
      const expected = [existingStyle, expectedTansformedStyle].join('\n');

      runCompilerTest(expected, done);
    });
  });

  describe('HMR', () => {
    it('should output HMR code block by default', (done) => {
      setupWebpackConfig({
        hmr: true,
      });

      runSourceTest(/module\.hot\.accept/g, null, done);
    });

    it('should output HMR code block when options.hmr is true', (done) => {
      styleLoaderOptions.hmr = true;

      setupWebpackConfig({
        hmr: true,
      });

      runSourceTest(/module\.hot\.accept/g, null, done);
    });

    it('should not output HMR code block when options.hmr is false', (done) => {
      styleLoaderOptions.hmr = false;

      setupWebpackConfig({
        hmr: true,
      });

      runSourceTest(null, /module\.hot\.accept/g, done);
    });
  });
});

describe('url tests', () => {
  let getOptions;
  let origGetOptions;

  beforeEach(() => {
    getOptions = jest.fn();

    origGetOptions = loaderUtils.getOptions;
    // Mock loaderUtils to override options
    loaderUtils.getOptions = getOptions;
  });

  afterEach(() => {
    loaderUtils.getOptions = origGetOptions;
  });

  it('should output HMR code by default', () => {
    expect(/(module\.hot)/g.test(url.pitch())).toBe(true);
  });

  it('should NOT output HMR code when options.hmr is false', () => {
    getOptions.mockReturnValue({ hmr: false });

    expect(/(module\.hot)/g.test(url.pitch())).toBe(false);
  });

  it('should output HMR code when options.hmr is true', () => {
    getOptions.mockReturnValue({ hmr: true });

    expect(/(module\.hot)/g.test(url.pitch())).toBe(true);
  });
});

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
