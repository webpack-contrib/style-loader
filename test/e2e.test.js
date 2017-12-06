const path = require('path');
const JSDOM = require('jsdom');
const webpack = require('./helpers/compiler');

describe('Loader', () => {
  test('E2E', async () => {
    const config = {
      rules: [
        {
          test: /\.css$/,
          use: [
            { loader: path.resolve(__dirname, '../src') },
            {
              loader: 'css-loader',
              options: {}
            }
          ]
        }
      ]
    }

    const stats = await webpack('fixture.js', config)
    const { assets } = stats.compilation

    const main = assets['main.js'].source();
    const runtime = assets['runtime.js'].source();

    // TODO move to test/helpers/dom
    const html = `<!doctype html><html><body><div id="root"></div></body></html>`

    const virtualConsole = JSDOM
      .createVirtualConsole()
      .sendTo(console)

    JSDOM.env({
      html,
      src: [ runtime, main ],
      virtualConsole,
      done (err, window) {
        const styles = window.document.head.innerHTML.trim();

        // free memory associated with the window
        window.close();

        expect(styles).toMatchSnapshot();
      }
    })
  })
})
