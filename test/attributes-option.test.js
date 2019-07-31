import { compile, getTestId, runTestInJsdom } from './helpers';

describe('attributes option', () => {
  const injectTypes = [
    'styleTag',
    'singletonStyleTag',
    'lazyStyleTag',
    'lazySingletonStyleTag',
    'linkTag',
  ];

  injectTypes.forEach((injectType) => {
    it(`should add attributes to tag when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const testId = getTestId('simple.js', injectType);
      const stats = await compile(testId, {
        loader: {
          options: {
            injectType,
            attributes: {
              type: 'text/css',
              foo: 'bar',
              'data-id': 'style-tag-id',
            },
          },
        },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`should add nonce attribute when "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const testId = getTestId('nonce-require.js', injectType);
      const stats = await compile(testId, {
        loader: { options: { injectType } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`should add nonce attribute when "injectType" option is "${injectType}" #2`, async () => {
      expect.assertions(3);

      const testId = getTestId('nonce-import.js', injectType);
      const stats = await compile(testId, {
        loader: { options: { injectType } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });
  });
});
