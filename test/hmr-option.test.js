import webpack from 'webpack';

import compile from './helpers/compiler';
import runTestInJsdom from './helpers/runTestInJsdom';

describe('hmr option', () => {
  const injectTypes = ['styleTag', 'useableStyleTag', 'linkTag'];

  injectTypes.forEach((injectType) => {
    expect.assertions(4);

    it(`not specified without HotModuleReplacementPlugin ("injectType" option is "${injectType}")`, async () => {
      const testId = './hot.js';
      const stats = await compile(testId, { loader: { injectType } });

      runTestInJsdom(stats, (dom) => {
        expect(dom.window.hotApi).not.toBeDefined();
      });

      const bundleSource = stats.compilation.assets['main.bundle.js'].source();

      expect(bundleSource).not.toMatch(/module\.hot\.accept/);

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`not specified with HotModuleReplacementPlugin ("injectType" option is "${injectType}")`, async () => {
      expect.assertions(4);

      const testId = './hot.js';
      const stats = await compile(testId, {
        plugins: [new webpack.HotModuleReplacementPlugin()],
        loader: { injectType },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.window.hotApi).toBeDefined();
      });

      const bundleSource = stats.compilation.assets['main.bundle.js'].source();

      expect(bundleSource).toMatch(/module\.hot\.accept/);

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`false without HotModuleReplacementPlugin ("injectType" option is "${injectType}")`, async () => {
      expect.assertions(4);

      const testId = './hot.js';
      const stats = await compile(testId, {
        loader: { injectType, options: { hmr: false } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.window.hotApi).not.toBeDefined();
      });

      const bundleSource = stats.compilation.assets['main.bundle.js'].source();

      expect(bundleSource).not.toMatch(/module\.hot\.accept/);

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`false with HotModuleReplacementPlugin ("injectType" option is "${injectType}")`, async () => {
      expect.assertions(4);

      const testId = './hot.js';
      const stats = await compile(testId, {
        plugins: [new webpack.HotModuleReplacementPlugin()],
        loader: { injectType, options: { hmr: false } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.window.hotApi).toBeDefined();
      });

      const bundleSource = stats.compilation.assets['main.bundle.js'].source();

      expect(bundleSource).not.toMatch(/module\.hot\.accept/);

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`true without HotModuleReplacementPlugin ("injectType" option is "${injectType}")`, async () => {
      expect.assertions(4);

      const testId = './hot.js';
      const stats = await compile(testId, {
        loader: { injectType, options: { hmr: true } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.window.hotApi).not.toBeDefined();
      });

      const bundleSource = stats.compilation.assets['main.bundle.js'].source();

      expect(bundleSource).not.toMatch(/module\.hot\.accept/);

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });

    it(`true with HotModuleReplacementPlugin ("injectType" option is "${injectType}")`, async () => {
      expect.assertions(4);

      const testId = './hot.js';
      const stats = await compile(testId, {
        plugins: [new webpack.HotModuleReplacementPlugin()],
        loader: { injectType, options: { hmr: true } },
      });

      runTestInJsdom(stats, (dom) => {
        expect(dom.window.hotApi).toBeDefined();
      });

      const bundleSource = stats.compilation.assets['main.bundle.js'].source();

      expect(bundleSource).toMatch(/module\.hot\.accept/);

      expect(stats.compilation.warnings).toMatchSnapshot('warnings');
      expect(stats.compilation.errors).toMatchSnapshot('errors');
    });
  });
});
