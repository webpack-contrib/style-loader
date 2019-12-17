const jsdom = require('jsdom');

function runInJsDom(stats, testFn) {
  const bundle = stats.compilation.assets['main.bundle.js'].source();
  const virtualConsole = new jsdom.VirtualConsole();

  virtualConsole.sendTo(console);

  try {
    const dom = new jsdom.JSDOM(
      `<!doctype html>
<html>
<head>
  <title>style-loader test</title>
  <style id="existing-style">.existing { color: yellow }</style>
</head>
<body>
  <h1>Body</h1>
  <div class="target"></div>
  <iframe class='iframeTarget'></iframe>
</body>
</html>
`,
      {
        resources: 'usable',
        runScripts: 'dangerously',
        virtualConsole,
      }
    );

    dom.window.eval(bundle);

    testFn(dom);

    // free memory associated with the window
    dom.window.close();
  } catch (e) {
    throw e;
  }
}

export default runInJsDom;
