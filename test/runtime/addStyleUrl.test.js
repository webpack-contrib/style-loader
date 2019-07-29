/* eslint-env browser */

import addStyleUrl from '../../src/runtime/addStyleUrl';

describe('addStyle', () => {
  beforeEach(() => {
    document.head.innerHTML = '<title>Title</title>';
    document.body.innerHTML = '<h1>Hello world</h1>';
  });

  // Each query should have be unique because style-loader caching styles in dom

  it('should work', () => {
    addStyleUrl('./style-1.css');

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "attributes" option', () => {
    addStyleUrl('./style-1.css', { attributes: { foo: 'bar' } });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });
});
