/* eslint-env browser */

import addStyle from '../../src/runtime/addStyles';

describe('addStyle', () => {
  beforeEach(() => {
    document.head.innerHTML = '<title>Title</title>';
    document.body.innerHTML = '<h1>Hello world</h1>';
  });

  // Each query should have be unique because style-loader caching styles in dom

  it('should work', () => {
    addStyle([['./style-1.css', '.foo { color: red }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with media', () => {
    addStyle([
      [
        './style-media.css',
        '.foo { color: red }',
        'screen and (min-width:320px)',
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work #2', () => {
    addStyle([
      ['./style-2-1.css', '.foo { color: red }', ''],
      ['./style-2-2.css', '.bar { color: blue }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "attrs" option', () => {
    addStyle([['./style-3.css', '.foo { color: red }', '']], {
      attrs: { foo: 'bar' },
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "attrs" option #2', () => {
    addStyle(
      [
        ['./style-4-1.css', '.foo { color: red }', ''],
        ['./style-4-2.css', '.bar { color: blue }', ''],
      ],
      {
        attrs: { foo: 'bar' },
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insertAt" option', () => {
    addStyle(
      [
        ['./style-5-1.css', '.foo { color: red }', ''],
        ['./style-5-2.css', '.bar { color: blue }', ''],
      ],
      {
        insertAt: 'top',
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insertAt" option #2', () => {
    addStyle(
      [
        ['./style-6-1.css', '.foo { color: red }', ''],
        ['./style-6-2.css', '.bar { color: blue }', ''],
      ],
      {
        insertAt: 'bottom',
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insertAt" option #3', () => {
    document.head.innerHTML =
      '<title>Title</title><script src="https://example.com/script.js" id="id"></script>';

    addStyle(
      [
        ['./style-7-1.css', '.foo { color: red }', ''],
        ['./style-7-2.css', '.bar { color: blue }', ''],
      ],
      {
        insertAt: {
          before: '#id',
        },
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insertInto" option', () => {
    addStyle(
      [
        ['./style-8-1.css', '.foo { color: red }', ''],
        ['./style-8-2.css', '.bar { color: blue }', ''],
      ],
      {
        insertInto: 'head',
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insertInto" option #2', () => {
    addStyle(
      [
        ['./style-9-1.css', '.foo { color: red }', ''],
        ['./style-9-2.css', '.bar { color: blue }', ''],
      ],
      {
        insertInto: 'body',
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insertInto" option #3', () => {
    document.body.innerHTML =
      '<h1>Hello world</h1><div><div id="root"></div></div>';

    addStyle(
      [
        ['./style-10-1.css', '.foo { color: red }', ''],
        ['./style-10-2.css', '.bar { color: blue }', ''],
      ],
      {
        insertInto: () => document.querySelector('#root'),
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "singleton" option', () => {
    addStyle(
      [
        ['./style-11-1.css', '.foo { color: red }', ''],
        ['./style-11-2.css', '.bar { color: blue }', ''],
      ],
      {
        singleton: true,
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "singleton" option', () => {
    addStyle(
      [
        ['./style-12-1.css', '.foo { color: red }', ''],
        ['./style-12-2.css', '.bar { color: blue }', ''],
      ],
      {
        singleton: false,
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "sourceMap" option', () => {
    addStyle([
      [
        './style-13.css',
        '.foo { color: red }',
        '',
        {
          version: 3,
          sources: ['style-1.css'],
          names: [],
          mappings: 'AAAA,cAAqB,eAAe,EAAE',
          file: 'style-1.css',
          sourcesContent: ['.foo { color: red }'],
        },
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with nonce', () => {
    // eslint-disable-next-line no-underscore-dangle
    window.__webpack_nonce__ = 'none';

    addStyle([['./style-14.css', '.foo { color: red }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle, no-undefined
    window.__webpack_nonce__ = undefined;
  });
});
