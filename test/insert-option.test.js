/* eslint-env browser */
import { compile, runTestInJsdom } from './helpers';

describe('insert option', () => {
  it('should insert styles in bottom when not specified', async () => {
    expect.assertions(3);

    const testId = './simple.js';
    const stats = await compile(testId);

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('should insert styles in bottom', async () => {
    expect.assertions(3);

    const testId = './simple.js';
    const stats = await compile(testId, {
      loader: {
        options: {
          insertAt: 'bottom',
        },
      },
    });

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('should insert styles in top', async () => {
    expect.assertions(3);

    const testId = './simple.js';
    const stats = await compile(testId, {
      loader: {
        options: {
          insertAt: 'top',
        },
      },
    });

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('should insert styles before "#existing-style" id', async () => {
    expect.assertions(3);

    const testId = './simple.js';
    const stats = await compile(testId, {
      loader: {
        options: {
          insertAt: {
            before: '#existing-style',
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

  it('should insert styles in bottom when selector was not found', async () => {
    expect.assertions(3);

    const testId = './simple.js';
    const stats = await compile(testId, {
      loader: {
        options: {
          insertAt: {
            before: '#missing',
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

  it('should insert styles into target', async () => {
    expect.assertions(3);

    const testId = './simple.js';
    const stats = await compile(testId, {
      loader: {
        options: {
          insertInto: 'div.target',
        },
      },
    });

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('should insert styles into target when target is iframe', async () => {
    expect.assertions(4);

    const selector = 'iframe.iframeTarget';
    const testId = './simple.js';
    const stats = await compile(testId, {
      loader: {
        options: {
          insertInto: selector,
        },
      },
    });

    runTestInJsdom(stats, (dom) => {
      expect(
        dom.window.document.querySelector(selector).contentDocument.head
          .innerHTML
      ).toMatchSnapshot('iframe head');
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('should insert styles in runtime created element', async () => {
    expect.assertions(3);

    const testId = './element.js';
    const stats = await compile(testId, {
      loader: {
        options: {
          insertInto: () => document.querySelector('#test-shadow'),
        },
      },
    });

    runTestInJsdom(stats, (dom) => {
      expect(dom.serialize()).toMatchSnapshot('DOM');
    });

    expect(stats.compilation.warnings).toMatchSnapshot('warnings');
    expect(stats.compilation.errors).toMatchSnapshot('errors');
  });

  it('should insert styles before exists styles', async () => {
    expect.assertions(3);

    const testId = './element.js';
    const stats = await compile(testId, {
      loader: {
        options: {
          insertInto: () => document.querySelector('head'),
          insertAt: {
            before: '#existing-style',
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
