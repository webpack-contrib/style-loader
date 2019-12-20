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
  const injectTypes = ['styleTag', 'lazyStyleTag', 'linkTag'];

  injectTypes.forEach((injectType) => {
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

      runInJsDom('main.bundle.js', compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
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
            rules: [
              {
                test: /\.css$/i,
                use: [
                  {
                    loader: path.resolve(__dirname, '../src/cjs.js'),
                    options: { injectType, esModule: true },
                  },
                  injectType === 'linkTag'
                    ? { loader: 'file-loader', options: { esModule: true } }
                    : { loader: 'css-loader', options: { esModule: true } },
                ],
              },
            ],
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom('main.bundle.js', compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
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
            rules: [
              {
                test: /\.css$/i,
                use: [
                  {
                    loader: path.resolve(__dirname, '../src/cjs.js'),
                    options: { injectType, esModule: true },
                  },
                  injectType === 'linkTag'
                    ? {
                        loader: 'file-loader',
                        options: { esModule: false },
                      }
                    : {
                        loader: 'css-loader',
                        options: { esModule: false },
                      },
                ],
              },
            ],
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom('main.bundle.js', compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(getWarnings(stats)).toMatchSnapshot('warnings');
      expect(getErrors(stats)).toMatchSnapshot('errors');
    });

    it(`should work with a value equal to "false" and when the "injectType" option is "${injectType}"`, async () => {
      const entry = getEntryByInjectType('simple.js', injectType);
      const compiler = getCompiler(entry, { injectType, esModule: false });
      const stats = await compile(compiler);

      runInJsDom('main.bundle.js', compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
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
            rules: [
              {
                test: /\.css$/i,
                use: [
                  {
                    loader: path.resolve(__dirname, '../src/cjs.js'),
                    options: { injectType, esModule: false },
                  },
                  injectType === 'linkTag'
                    ? { loader: 'file-loader', options: { esModule: true } }
                    : { loader: 'css-loader', options: { esModule: true } },
                ],
              },
            ],
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom('main.bundle.js', compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
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
            rules: [
              {
                test: /\.css$/i,
                use: [
                  {
                    loader: path.resolve(__dirname, '../src/cjs.js'),
                    options: { injectType, esModule: false },
                  },
                  injectType === 'linkTag'
                    ? {
                        loader: 'file-loader',
                        options: { esModule: false },
                      }
                    : {
                        loader: 'css-loader',
                        options: { esModule: false },
                      },
                ],
              },
            ],
          },
        }
      );
      const stats = await compile(compiler);

      runInJsDom('main.bundle.js', compiler, stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(getWarnings(stats)).toMatchSnapshot('warnings');
      expect(getErrors(stats)).toMatchSnapshot('errors');
    });
  });
});
