/* eslint-env browser */

import injectStylesIntoLinkTag from '../../src/runtime/injectStylesIntoLinkTag';

describe('addStyle', () => {
  beforeEach(() => {
    document.head.innerHTML = '<title>Title</title>';
    document.body.innerHTML = '<h1>Hello world</h1>';
  });

  // Each query should have be unique because style-loader caching styles in dom

  it('should work', () => {
    injectStylesIntoLinkTag('./style-1.css');

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "attributes" option', () => {
    injectStylesIntoLinkTag('./style-1.css', { attributes: { foo: 'bar' } });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "__webpack_nonce__" variable', () => {
    // eslint-disable-next-line no-underscore-dangle
    window.__webpack_nonce__ = 'none';

    injectStylesIntoLinkTag('./style-1.css');

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle, no-undefined
    window.__webpack_nonce__ = undefined;
  });
});
