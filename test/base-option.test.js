import compile from './helpers/compiler';
import runTestInJsdom from './helpers/runTestInJsdom';

describe('base option', () => {
  it('should work', async () => {
    expect.assertions(3);

    const testId = './simple.js';
    const stats = await compile(testId, {
      loader: {
        options: {
          base: 1000,
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
