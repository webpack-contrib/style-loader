/* eslint-env browser */
import { compile, getTestId, runTestInJsdom } from './helpers';

describe('insert option', () => {
  const injectTypes = [
    'styleTag',
    'singletonStyleTag',
    'lazyStyleTag',
    'lazySingletonStyleTag',
    'linkTag',
  ];

  injectTypes.forEach((injectType) => {
    it(`should insert styles into "head" bottom when not specified and when the "injectType" option is "${injectType}"`, async () => {
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

    it(`should insert styles into "body" bottom when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const testId = getTestId('simple.js', injectType);
      const stats = await compile(testId, {
        loader: { options: { injectType, insert: 'body' } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`should insert styles into "div.target" bottom when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const testId = getTestId('simple.js', injectType);
      const stats = await compile(testId, {
        loader: { options: { injectType, insert: 'div.target' } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`should insert styles into "iframe.iframeTarget" bottom when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(4);

      const selector = 'iframe.iframeTarget';
      const testId = getTestId('simple.js', injectType);
      const stats = await compile(testId, {
        loader: { options: { injectType, insert: selector } },
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

    it(`should insert styles into runtime created element bottom when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const testId = getTestId('element.js', injectType);
      const stats = await compile(testId, {
        loader: {
          options: {
            injectType,
            insert: (element) =>
              document.querySelector('#test-shadow').appendChild(element),
          },
        },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.serialize()).toMatchSnapshot('DOM');
      });

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`should insert styles into "head" top when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const testId = getTestId('simple.js', injectType);
      const stats = await compile(testId, {
        loader: {
          options: {
            injectType,
            insert: (element) => {
              const parent = document.querySelector('head');
              const lastInsertedElement =
                // eslint-disable-next-line no-underscore-dangle
                window._lastElementInsertedByStyleLoader;

              if (!lastInsertedElement) {
                parent.insertBefore(element, parent.firstChild);
              } else if (lastInsertedElement.nextSibling) {
                parent.insertBefore(element, lastInsertedElement.nextSibling);
              } else {
                parent.appendChild(element);
              }

              // eslint-disable-next-line no-underscore-dangle
              window._lastElementInsertedByStyleLoader = element;
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

    it(`should insert styles into before "#existing-style" id when the "injectType" option is "${injectType}"`, async () => {
      expect.assertions(3);

      const testId = getTestId('simple.js', injectType);
      const stats = await compile(testId, {
        loader: {
          options: {
            injectType,
            insert: (element) => {
              const parent = document.querySelector('head');
              const target = document.querySelector('#existing-style');

              const lastInsertedElement =
                // eslint-disable-next-line no-underscore-dangle
                window._lastElementInsertedByStyleLoader;

              if (!lastInsertedElement) {
                parent.insertBefore(element, target);
              } else if (lastInsertedElement.nextSibling) {
                parent.insertBefore(element, lastInsertedElement.nextSibling);
              } else {
                parent.appendChild(element);
              }

              // eslint-disable-next-line no-underscore-dangle
              window._lastElementInsertedByStyleLoader = element;
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
});
