import compile from './helpers/compiler';
import runTestInJsdom from './helpers/runTestInJsdom';

describe('singleton option', () => {
  it('not specified', async () => {
    expect.assertions(3);

    const testId = './singleton.js';
    const stats = await compile(testId);

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('false', async () => {
    expect.assertions(3);

    const testId = './singleton.js';
    const stats = await compile(testId, {
      loader: {
        options: {
          singleton: false,
        },
      },
    });

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('true', async () => {
    expect.assertions(3);

    const testId = './singleton.js';
    const stats = await compile(testId, {
      loader: {
        options: {
          singleton: true,
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
