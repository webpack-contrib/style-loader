import path from 'path';

import {
  compile,
  getCompiler,
  getEntryByInjectType,
  getErrors,
  getWarnings,
  runInJsDom,
} from './helpers/index';

describe('"esModule" option', () => {
  // Todo uncomment and fix "linkTag"
  const injectTypes = [
    'styleTag',
    'singletonStyleTag',
    'lazyStyleTag',
    'lazySingletonStyleTag',
    // 'linkTag',
  ];
  const commonjsExports = {
    styleTag: 'module.exports = content.locals || {}',
    singletonStyleTag: 'module.exports = content.locals || {}',
    lazyStyleTag: 'module.exports = exported',
    lazySingletonStyleTag: 'module.exports = exported',
  };

  injectTypes.forEach((injectType) => {
    const commonjsExport = commonjsExports[injectType];

    it(`should work when not specified and when the "injectType" option is "${injectType}"`, async () => {
      const entry = getEntryByInjectType('simple.js', injectType);
      const compiler = getCompiler(entry, { injectType });
      const stats = await compile(compiler);

      runInJsDom('main.bundle.js', compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(getWarnings(stats)).toMatchSnapshot('warnings');
      expect(getErrors(stats)).toMatchSnapshot('errors');
    });

    it(`should work with a value equal to "true" and when the "injectType" option is "${injectType}"`, async () => {
      const entry = getEntryByInjectType('simple.js', injectType);
      const compiler = getCompiler(entry, { injectType, esModule: true });
      const stats = await compile(compiler);

      runInJsDom('main.bundle.js', compiler, stats, (dom, bundle) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');

        if (commonjsExport) {
          expect(bundle).not.toEqual(expect.stringContaining(commonjsExport));
        }
      });

      expect(getWarnings(stats)).toMatchSnapshot('warnings');
      expect(getErrors(stats)).toMatchSnapshot('errors');
    });

    it(`should work with a value equal to "true" and when the "injectType" option is "${injectType}" and ES module syntax used`, async () => {
      const entry = getEntryByInjectType('simple.js', injectType);
      const compiler = getCompiler(
        entry,
        { injectType },
        {
          module: {
            rules: [].concat(
              injectType === 'linkTag'
                ? [
                    {
                      test: /\.css$/i,
                      loader: path.resolve(__dirname, '../src/cjs.js'),
                      options: { injectType, esModule: true },
                      type: 'asset/resource',
                      generator: {
                        filename: '[path][name][ext]',
                      },
                    },
                  ]
                : [
                    {
                      test: /\.css$/i,
                      use: [
                        {
                          loader: path.resolve(__dirname, '../src/cjs.js'),
                          options: { injectType, esModule: true },
                        },
                        {
                          loader: 'css-loader',
                          options: { esModule: true },
                        },
                      ],
                    },
                  ]
            ),
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom('main.bundle.js', compiler, stats, (dom, bundle) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');

        if (commonjsExport) {
          expect(bundle).not.toEqual(expect.stringContaining(commonjsExport));
        }
      });

      expect(getWarnings(stats)).toMatchSnapshot('warnings');
      expect(getErrors(stats)).toMatchSnapshot('errors');
    });

    it(`should work with a value equal to "true" and when the "injectType" option is "${injectType}" and CommonJS module syntax used`, async () => {
      const entry = getEntryByInjectType('simple.js', injectType);
      const compiler = getCompiler(
        entry,
        { injectType },
        {
          module: {
            rules: [].concat(
              injectType === 'linkTag'
                ? [
                    {
                      test: /\.css$/i,
                      loader: path.resolve(__dirname, '../src/cjs.js'),
                      options: { injectType, esModule: true },
                      type: 'asset/resource',
                      generator: {
                        filename: '[path][name][ext]',
                      },
                    },
                  ]
                : [
                    {
                      test: /\.css$/i,
                      use: [
                        {
                          loader: path.resolve(__dirname, '../src/cjs.js'),
                          options: { injectType, esModule: true },
                        },
                        {
                          loader: 'css-loader',
                          options: { esModule: false },
                        },
                      ],
                    },
                  ]
            ),
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom('main.bundle.js', compiler, stats, (dom, bundle) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');

        if (commonjsExport) {
          expect(bundle).not.toEqual(expect.stringContaining(commonjsExport));
        }
      });

      expect(getWarnings(stats)).toMatchSnapshot('warnings');
      expect(getErrors(stats)).toMatchSnapshot('errors');
    });

    it(`should work with a value equal to "false" and when the "injectType" option is "${injectType}"`, async () => {
      const entry = getEntryByInjectType('simple.js', injectType);
      const compiler = getCompiler(entry, { injectType, esModule: false });
      const stats = await compile(compiler);

      runInJsDom('main.bundle.js', compiler, stats, (dom, bundle) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');

        if (commonjsExport) {
          expect(bundle).toEqual(expect.stringContaining(commonjsExport));
        }
      });

      expect(getWarnings(stats)).toMatchSnapshot('warnings');
      expect(getErrors(stats)).toMatchSnapshot('errors');
    });

    it(`should work with a value equal to "false" and when the "injectType" option is "${injectType}" and ES module syntax used`, async () => {
      const entry = getEntryByInjectType('simple.js', injectType);
      const compiler = getCompiler(
        entry,
        { injectType },
        {
          module: {
            rules: [].concat(
              injectType === 'linkTag'
                ? [
                    {
                      test: /\.css$/i,
                      loader: path.resolve(__dirname, '../src/cjs.js'),
                      options: { injectType, esModule: false },
                      type: 'asset/resource',
                      generator: {
                        filename: '[path][name][ext]',
                      },
                    },
                  ]
                : [
                    {
                      test: /\.css$/i,
                      use: [
                        {
                          loader: path.resolve(__dirname, '../src/cjs.js'),
                          options: { injectType, esModule: false },
                        },
                        {
                          loader: 'css-loader',
                          options: { esModule: true },
                        },
                      ],
                    },
                  ]
            ),
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom('main.bundle.js', compiler, stats, (dom, bundle) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');

        if (commonjsExport) {
          expect(bundle).toEqual(expect.stringContaining(commonjsExport));
        }
      });

      expect(getWarnings(stats)).toMatchSnapshot('warnings');
      expect(getErrors(stats)).toMatchSnapshot('errors');
    });

    it(`should work with a value equal to "false" and when the "injectType" option is "${injectType}" and CommonJS module syntax used`, async () => {
      const entry = getEntryByInjectType('simple.js', injectType);
      const compiler = getCompiler(
        entry,
        { injectType },
        {
          module: {
            rules: [].concat(
              injectType === 'linkTag'
                ? [
                    {
                      test: /\.css$/i,
                      loader: path.resolve(__dirname, '../src/cjs.js'),
                      options: { injectType, esModule: false },
                      type: 'asset/resource',
                      generator: {
                        filename: '[path][name][ext]',
                      },
                    },
                  ]
                : [
                    {
                      test: /\.css$/i,
                      use: [
                        {
                          loader: path.resolve(__dirname, '../src/cjs.js'),
                          options: { injectType, esModule: false },
                        },
                        {
                          loader: 'css-loader',
                          options: { esModule: false },
                        },
                      ],
                    },
                  ]
            ),
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom('main.bundle.js', compiler, stats, (dom, bundle) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');

        if (commonjsExport) {
          expect(bundle).toEqual(expect.stringContaining(commonjsExport));
        }
      });

      expect(getWarnings(stats)).toMatchSnapshot('warnings');
      expect(getErrors(stats)).toMatchSnapshot('errors');
    });
  });
});
