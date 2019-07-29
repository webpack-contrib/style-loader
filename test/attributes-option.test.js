import compile from './helpers/compiler';
import runTestInJsdom from './helpers/runTestInJsdom';

describe('attributes option', () => {
  const injectTypes = ['styleTag', 'useableStyleTag', 'linkTag'];

  injectTypes.forEach((injectType) => {
    it(`should add attributes to tag ("injectType" option is "${injectType}")`, async () => {
      expect.assertions(3);

      const testId =
        injectType === 'useableStyleTag' ? './useable.js' : './simple.js';
      const stats = await compile(testId, {
        loader: {
          injectType,
          options: {
            attributes: {
              id: 'style-tag-id',
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

    it(`should override/add default type attribute to tag ("injectType" option is "${injectType}")`, async () => {
      expect.assertions(3);

      const testId =
        injectType === 'useableStyleTag' ? './useable.js' : './simple.js';
      const stats = await compile(testId, {
        loader: {
          injectType,
          options: {
            attributes: {
              type: 'text/less',
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
  });

  it('should add nonce attribute', async () => {
    expect.assertions(3);

    const testId = './nonce-require.js';
    const stats = await compile(testId);

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('should add nonce attribute #2', async () => {
    expect.assertions(3);

    const testId = './nonce-import.js';
    const stats = await compile(testId);

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });
});
