import compile from './helpers/compiler';
import runTestInJsdom from './helpers/runTestInJsdom';

describe('sourceMap option', () => {
  it('not specified', async () => {
    expect.assertions(3);

    const testId = './simple.js';
    const stats = await compile(testId, {
      devtool: 'source-map',
    });

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('false', async () => {
    expect.assertions(3);

    const testId = './simple.js';
    const stats = await compile(testId, {
      devtool: 'source-map',
      loader: {
        options: {
          sourceMap: false,
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

    const testId = './simple.js';
    const stats = await compile(testId, {
      devtool: 'source-map',
      loader: {
        options: {
          sourceMap: true,
        },
      },
      cssLoader: {
        options: {
          sourceMap: true,
        },
      },
    });

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('true, but previous loader do not generate source map', async () => {
    expect.assertions(3);

    const testId = './simple.js';
    const stats = await compile(testId, {
      devtool: 'source-map',
      loader: {
        options: {
          sourceMap: true,
        },
      },
      cssLoader: {
        options: {
          sourceMap: false,
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
