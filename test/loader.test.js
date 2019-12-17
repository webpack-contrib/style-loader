/* eslint-env browser */

import webpack from 'webpack';

import { compile, getTestId, runTestInJsdom } from './helpers';

describe('loader', () => {
  const injectTypes = [
    'styleTag',
    'singletonStyleTag',
    'lazyStyleTag',
    'lazySingletonStyleTag',
    'linkTag',
  ];

  it('should work', async () => {
    const testId = './simple.js';
    const stats = await compile(testId);

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('should work when the "injectType" option is "linkTag" and "file-loader" uses ES module syntax', async () => {
    const testId = './simple.js';
    const stats = await compile(testId, {
      loader: { options: { injectType: 'linkTag' } },
      fileLoader: { options: { esModule: true } },
    });

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('should work when the "injectType" option is "linkTag" and "file-loader" uses CommonJS module syntax', async () => {
    const testId = './simple.js';
    const stats = await compile(testId, {
      loader: { options: { injectType: 'linkTag' } },
      fileLoader: { options: { esModule: false } },
    });

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  injectTypes.forEach((injectType) => {
    it(`should work when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const testId = getTestId('simple.js', injectType);
      const stats = await compile(testId, {
        loader: { options: { injectType } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`should work with css modules when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const testId = getTestId('css-modules.js', injectType);
      const stats = await compile(testId, {
        loader: { options: { injectType } },
        cssLoader: {
          options: {
            modules: { localIdentName: '[name]-[local]_[hash:base64:7]' },
          },
        },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`should not inject hmr code without HotModuleReplacementPlugin when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(4);

      const testId = './hot.js';
      const stats = await compile(testId, {
        loader: { options: { injectType } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.window.hotApi).not.toBeDefined();
      });

      const bundleSource = stats.compilation.assets['main.bundle.js'].source();

      expect(bundleSource).not.toMatch(/module\.hot\.accept/);

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`should inject hmr code with HotModuleReplacementPlugin when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(4);

      const testId = './hot.js';
      const stats = await compile(testId, {
        plugins: [new webpack.HotModuleReplacementPlugin()],
        loader: { options: { injectType } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.window.hotApi).toBeDefined();
      });

      const bundleSource = stats.compilation.assets['main.bundle.js'].source();

      expect(bundleSource).toMatch(/module\.hot\.accept/);

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`should not generate source maps when previous loader don't emit them when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const testId = getTestId('simple.js', injectType);
      const stats = await compile(testId, {
        devtool: 'source-map',
        loader: { options: { injectType } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    // `linkTag` doesn't generate source maps, original source should contains them
    it(`should generate source maps when previous loader emit them when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const testId = getTestId('simple.js', injectType);
      const stats = await compile(testId, {
        devtool: 'source-map',
        loader: { options: { injectType } },
        cssLoader: { options: { sourceMap: true } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    // Uncomment after `css-loader` release the `esModule` option
    // if (
    //   [
    //     'styleTag',
    //     'singletonStyleTag',
    //     'lazyStyleTag',
    //     'lazySingletonStyleTag',
    //   ].includes(injectType)
    // ) {
    //   it(`should work when the "injectType" option is "${injectType}" and "css-loader" uses ES module syntax`, async () => {
    //     const testId = getTestId('simple.js', injectType);
    //     const stats = await compile(testId, {
    //       loader: { options: { injectType } },
    //       cssLoader: { options: { esModule: true } },
    //     });
    //
    //     runTestInJsdom(stats, (dom) => {
    //       expect(dom.serialize()).toMatchSnapshot('DOM');
    //     });
    //
    //     expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    //     expect(stats.compilation.errors).toMatchSnapshot('errors');
    //   });
    //
    //   it(`should work when the "injectType" option is "${injectType}" and "css-loader" uses CommonJS module syntax`, async () => {
    //     const testId = getTestId('simple.js', injectType);
    //     const stats = await compile(testId, {
    //       loader: { options: { injectType } },
    //       cssLoader: { options: { esModule: true } },
    //     });
    //
    //     runTestInJsdom(stats, (dom) => {
    //       expect(dom.serialize()).toMatchSnapshot('DOM');
    //     });
    //
    //     expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    //     expect(stats.compilation.errors).toMatchSnapshot('errors');
    //   });
    // }

    if (['lazyStyleTag', 'lazySingletonStyleTag'].includes(injectType)) {
      it(`should work when ref is negative when the "injectType" option is "${injectType}"`, async () => {
        expect.assertions(3);

        const testId = './lazy-negative-refs.js';
        const stats = await compile(testId, {
          loader: { options: { injectType } },
        });

        runTestInJsdom(stats, (dom) => {
          expect(dom.serialize()).toMatchSnapshot('DOM');
        });

        expect(stats.compilation.warnings).toMatchSnapshot('warnings');
        expect(stats.compilation.errors).toMatchSnapshot('errors');
      });
    }
  });
});
