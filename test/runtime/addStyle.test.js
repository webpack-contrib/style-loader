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

  it('should work with "attributes" option', () => {
    addStyle([['./style-3.css', '.foo { color: red }', '']], {
      attributes: { foo: 'bar' },
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "attributes" option #2', () => {
    addStyle(
      [
        ['./style-4-1.css', '.foo { color: red }', ''],
        ['./style-4-2.css', '.bar { color: blue }', ''],
      ],
      {
        attributes: { foo: 'bar' },
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

  it('should work with updates', () => {
    const updateStyle = addStyle([
      ['./style-15.css', '.foo { color: red }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([['./style-15.css', '.foo { color: blue }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #2', () => {
    const updateStyle = addStyle([
      ['./style-16.css', '.foo { color: red }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([
      ['./style-16.css', '.foo { color: blue }', ''],
      ['./style-17.css', '.foo { color: red }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #3', () => {
    const updateStyle = addStyle([
      ['./style-18.css', '.foo { color: red }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([['./style-19.css', '.foo { color: blue }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #5', () => {
    const updateStyle = addStyle([
      ['./style-20.css', '.foo { color: blue }', 'screen and (min-width:320px'],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([
      ['./style-20.css', '.foo { color: blue }', 'screen and (min-width:320px'],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #6', () => {
    const updateStyle = addStyle(
      [
        ['./style-21.css', '.foo { color: red }', ''],
        ['./style-22.css', '.foo { color: yellow }', ''],
      ],
      { singleton: true }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([
      ['./style-21.css', '.foo { color: blue }', ''],
      ['./style-22.css', '.foo { color: yellow }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #7', () => {
    const updateStyle = addStyle([
      ['./style-23.css', '.foo { color: red }', ''],
      ['./style-24.css', '.foo { color: blue }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([
      ['./style-23.css', '.foo { color: green }', ''],
      ['./style-25.css', '.foo { color: black }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #8', () => {
    document.body.innerHTML = '<h1>Hello world</h1><div id="id"></div>';

    const updateStyle = addStyle(
      [['./style-26.css', '.foo { color: red }', '']],
      {
        insertInto: () => document.querySelector('#id'),
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #9', () => {
    document.body.innerHTML = '<h1>Hello world</h1><div id="id"></div>';

    const updateStyle = addStyle(
      [
        ['./style-37.css', '.foo { color: blue }', ''],
        ['./style-38.css', '.foo { color: yellow }', ''],
      ],
      {
        insertInto: () => document.querySelector('#id'),
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([['./style-37.css', '.foo { color: black }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #10', () => {
    document.body.innerHTML =
      '<h1>Hello world</h1><div><div id="custom"></div></div>';

    const updateStyle = addStyle(
      [['./style-38.css', '.foo { color: red }', '']],
      {
        insertInto: '#custom',
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    const element = document.querySelector('#custom');

    element.parentNode.removeChild(element);

    updateStyle([['./style-38.css', '.foo { color: blue }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #11', () => {
    const updateStyle = addStyle(
      [['./style-39.css', '.foo { color: red }', '']],
      {
        insertAt: 'top',
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #12', () => {
    const updateStyle = addStyle([
      [
        './style-40.css',
        '.foo { color: red }',
        '',
        {
          version: 3,
          sources: ['style-40.css'],
          names: [],
          mappings: 'AAAA,cAAqB,eAAe,EAAE',
          file: 'style-40.css',
          sourcesContent: ['.foo { color: red }'],
        },
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([
      [
        './style-40.css',
        '.foo { color: black }',
        '',
        {
          version: 3,
          sources: ['style-40.css'],
          names: [],
          mappings: 'BBBB,cAAqB,eAAe,EAAE',
          file: 'style-40.css',
          sourcesContent: ['.foo { color: black }'],
        },
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #13', () => {
    const updateStyle = addStyle([
      ['./style-41.css', '.foo { color: red }', 'screen and (min-width:320px)'],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([
      [
        './style-41.css',
        '.foo { color: black }',
        'screen and (min-width:640px)',
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #14', () => {
    const updateStyle = addStyle([
      [
        './style-42.css',
        '.foo { color: red }',
        '',
        {
          version: 3,
          sources: ['style-42.css'],
          names: [],
          mappings: 'AAAA,cAAqB,eAAe,EAAE',
          file: 'style-42.css',
          sourcesContent: ['.foo { color: red }'],
        },
      ],
      [
        './style-43.css',
        '.bar { color: yellow }',
        '',
        {
          version: 3,
          sources: ['style-43.css'],
          names: [],
          mappings: 'AAAA,cAAqB,eAAe,EAAE',
          file: 'style-43.css',
          sourcesContent: ['.foo { color: red }'],
        },
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([
      ['./style-42.css', '.foo { color: black }', ''],
      ['./style-43.css', '.bar { color: gray }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #15', () => {
    const updateStyle = addStyle([
      ['./style-44.css', '.foo { color: red }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([
      ['./style-44.css', '.foo { color: black }', ''],
      ['./style-44.css', '.foo { color: red }', ''],
      ['./style-44.css', '.foo { color: yellow }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should insert style tag in iframe', () => {
    document.body.innerHTML =
      "<h1>Hello world</h1><iframe class='iframeTarget'/>";

    addStyle([['./style-27.css', '.foo { color: red }', '']], {
      insertInto: 'iframe.iframeTarget',
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
    expect(
      document.getElementsByClassName('iframeTarget')[0].contentDocument.head
        .innerHTML
    ).toMatchSnapshot();
  });

  it('should work with "base" option', () => {
    addStyle([['./style-28.css', '.foo { color: red }', '']], { base: 1000 });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with same module id in list', () => {
    const updateStyle = addStyle([
      ['./style-29.css', '.foo { color: red }', ''],
      ['./style-29.css', '.foo { color: green }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([
      ['./style-29.css', '.foo { color: black }', ''],
      ['./style-29.css', '.foo { color: yellow }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should throw error with invalid "insertInto" option', () => {
    expect(() =>
      addStyle([['./style-30.css', '.foo { color: red }', '']], {
        insertInto: '#test><><><',
      })
    ).toThrowErrorMatchingSnapshot();
  });

  it('should throw error with invalid "insertAt" option', () => {
    expect(() =>
      addStyle([['./style-31.css', '.foo { color: red }', '']], {
        insertAt: 'invalid',
      })
    ).toThrowErrorMatchingSnapshot();
  });

  it('should work "insertAt" option and with children', () => {
    const updateStyle = addStyle(
      [['./style-32.css', '.foo { color: red }', '']],
      {
        insertAt: 'top',
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    updateStyle([['./style-32.css', '.foo { color: blue }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should throw error with invalid "insertInto" option', () => {
    expect(() =>
      addStyle([['./style-33.css', '.foo { color: red }', '']], {
        insertInto: 'invalid',
      })
    ).toThrowErrorMatchingSnapshot();
  });

  it('should work with "transform" option', () => {
    addStyle([['./style-34.css', '.foo { color: red }', '']], {
      transform: (css) => {
        return css.replace('red', 'yellow');
      },
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "transform" option #2', () => {
    addStyle([['./style-35.css', '.foo { color: red }', '']], {
      transform: {
        default: (css) => {
          return css.replace('red', 'yellow');
        },
      },
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "transform" option #3', () => {
    addStyle([['./style-36.css', '.foo { color: red }', '']], {
      transform: () => {
        return false;
      },
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });
});
