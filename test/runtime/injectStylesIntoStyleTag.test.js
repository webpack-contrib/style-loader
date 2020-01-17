/* eslint-env browser */

import injectStylesIntoStyleTag from '../../src/runtime/injectStylesIntoStyleTag';

function insertAtTop(element) {
  const parent = document.querySelector('head');
  // eslint-disable-next-line no-underscore-dangle
  const lastInsertedElement = window._lastElementInsertedByStyleLoader;

  if (!lastInsertedElement) {
    parent.insertBefore(element, parent.firstChild);
  } else if (lastInsertedElement.nextSibling) {
    parent.insertBefore(element, lastInsertedElement.nextSibling);
  } else {
    parent.appendChild(element);
  }

  // eslint-disable-next-line no-underscore-dangle
  window._lastElementInsertedByStyleLoader = element;
}

function insertBeforeAt(element) {
  const parent = document.querySelector('head');
  const target = document.querySelector('#id');

  // eslint-disable-next-line no-underscore-dangle
  const lastInsertedElement = window._lastElementInsertedByStyleLoader;

  if (!lastInsertedElement) {
    parent.insertBefore(element, target);
  } else if (lastInsertedElement.nextSibling) {
    parent.insertBefore(element, lastInsertedElement.nextSibling);
  } else {
    parent.appendChild(element);
  }

  // eslint-disable-next-line no-underscore-dangle
  window._lastElementInsertedByStyleLoader = element;
}

describe('addStyle', () => {
  beforeEach(() => {
    document.head.innerHTML = '<title>Title</title>';
    document.body.innerHTML = '<h1>Hello world</h1>';
  });

  // Each query should have be unique because style-loader caching styles in dom

  it('should work', () => {
    injectStylesIntoStyleTag([['./style-1.css', '.foo { color: red }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with multiple styles', () => {
    injectStylesIntoStyleTag([
      ['./style-2-1.css', '.foo { color: red }', ''],
      ['./style-2-2.css', '.bar { color: blue }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with same module id in list', () => {
    injectStylesIntoStyleTag([
      ['./style-3.css', '.foo { color: red }', ''],
      ['./style-3.css', '.foo { color: green }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with media', () => {
    injectStylesIntoStyleTag([
      ['./style-4.css', '.foo { color: red }', 'screen and (min-width:320px)'],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with source maps', () => {
    injectStylesIntoStyleTag([
      [
        './style-5.css',
        '.foo { color: red }',
        '',
        {
          version: 3,
          sources: ['style-5.css'],
          names: [],
          mappings: 'AAAA,cAAqB,eAAe,EAAE',
          file: 'style-5.css',
          sourcesContent: ['.foo { color: red }'],
        },
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "__webpack_nonce__" variable', () => {
    // eslint-disable-next-line no-underscore-dangle
    window.__webpack_nonce__ = '12345678';

    injectStylesIntoStyleTag([['./style-6.css', '.foo { color: red }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle, no-undefined
    window.__webpack_nonce__ = undefined;
  });

  it('should work with "nonce" attribute and "__webpack_nonce__" variable', () => {
    // eslint-disable-next-line no-underscore-dangle
    window.__webpack_nonce__ = '12345678';

    injectStylesIntoStyleTag([['./style-7.css', '.foo { color: red }', '']], {
      attributes: { nonce: '87654321' },
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle, no-undefined
    window.__webpack_nonce__ = undefined;
  });

  it('should work with "base" option', () => {
    injectStylesIntoStyleTag([['./style-8.css', '.foo { color: red }', '']], {
      base: 1000,
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "attributes" option', () => {
    injectStylesIntoStyleTag([['./style-9.css', '.foo { color: red }', '']], {
      attributes: { foo: 'bar' },
    });

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "attributes" option #2', () => {
    injectStylesIntoStyleTag(
      [
        ['./style-10-1.css', '.foo { color: red }', ''],
        ['./style-10-2.css', '.bar { color: blue }', ''],
      ],
      {
        attributes: { foo: 'bar' },
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insert" option', () => {
    injectStylesIntoStyleTag(
      [
        ['./style-11-1.css', '.foo { color: red }', ''],
        ['./style-11-2.css', '.bar { color: blue }', ''],
      ],
      {
        insert: 'head',
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insert" option #2', () => {
    injectStylesIntoStyleTag(
      [
        ['./style-12-1.css', '.foo { color: red }', ''],
        ['./style-12-2.css', '.bar { color: blue }', ''],
      ],
      {
        insert: 'body',
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insert" option #3', () => {
    document.body.innerHTML =
      "<h1>Hello world</h1><iframe class='iframeTarget'/>";

    injectStylesIntoStyleTag(
      [
        ['./style-13-1.css', '.foo { color: red }', ''],
        ['./style-13-2.css', '.bar { color: blue }', ''],
      ],
      {
        insert: 'iframe.iframeTarget',
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
    expect(
      document.getElementsByClassName('iframeTarget')[0].contentDocument.head
        .innerHTML
    ).toMatchSnapshot();
  });

  it('should work with "insert" option #4', () => {
    injectStylesIntoStyleTag(
      [
        ['./style-14-1.css', '.foo { color: red }', ''],
        ['./style-14-2.css', '.bar { color: blue }', ''],
      ],
      {
        insert: insertAtTop,
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle
    window._lastElementInsertedByStyleLoader = null;
  });

  it('should work with "insert" option #5', () => {
    document.head.innerHTML =
      '<title>Title</title><script src="https://example.com/script.js" id="id"></script>';

    injectStylesIntoStyleTag(
      [
        ['./style-15-1.css', '.foo { color: red }', ''],
        ['./style-15-2.css', '.bar { color: blue }', ''],
      ],
      {
        insert: insertBeforeAt,
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with "insert" option #6', () => {
    document.body.innerHTML =
      '<h1>Hello world</h1><div><div id="root"></div></div>';

    injectStylesIntoStyleTag(
      [
        ['./style-16-1.css', '.foo { color: red }', ''],
        ['./style-16-2.css', '.bar { color: blue }', ''],
      ],
      {
        insert: (style) => document.querySelector('#root').appendChild(style),
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should throw error with incorrect "insert" option', () => {
    expect(() =>
      injectStylesIntoStyleTag(
        [['./style-17.css', '.foo { color: red }', '']],
        {
          insert: 'invalid',
        }
      )
    ).toThrowErrorMatchingSnapshot();
  });

  it('should throw error with invalid "insert" option', () => {
    expect(() =>
      injectStylesIntoStyleTag(
        [['./style-18.css', '.foo { color: red }', '']],
        {
          insert: '#test><><><',
        }
      )
    ).toThrowErrorMatchingSnapshot();
  });

  it('should work with updates', () => {
    const update = injectStylesIntoStyleTag([
      ['./style-19.css', '.foo { color: red }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([['./style-19.css', '.foo { color: blue }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #2', () => {
    const update = injectStylesIntoStyleTag([
      ['./style-20-1.css', '.foo { color: red }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([['./style-20-2.css', '.foo { color: blue }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #3', () => {
    const update = injectStylesIntoStyleTag([
      ['./style-21-1.css', '.foo { color: red }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([
      ['./style-21-1.css', '.foo { color: blue }', ''],
      ['./style-21-2.css', '.foo { color: red }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #4', () => {
    const update = injectStylesIntoStyleTag([
      ['./style-22.css', '.foo { color: red }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #5', () => {
    const update = injectStylesIntoStyleTag([
      ['./style-23.css', '.foo { color: red }', 'screen and (min-width:320px)'],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([
      [
        './style-23.css',
        '.foo { color: blue }',
        'screen and (min-width:640px)',
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #6', () => {
    const update = injectStylesIntoStyleTag(
      [
        ['./style-24-1.css', '.foo { color: red }', ''],
        ['./style-24-2.css', '.bar { color: yellow }', ''],
      ],
      { singleton: true }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([
      ['./style-24-1.css', '.foo { color: blue }', ''],
      ['./style-24-2.css', '.bar { color: yellow }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([
      ['./style-24-1.css', '.foo { color: yellow }', ''],
      [
        './style-24-2.css',
        '.bar { color: red }',
        'screen and (min-width: 100px)',
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([
      ['./style-24-1.css', '.foo { color: yellow }', ''],
      [
        './style-24-2.css',
        '.bar { color: red }',
        'screen and (min-width: 200px)',
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([
      ['./style-24-1.css', '.foo { color: red }', ''],
      [
        './style-24-2.css',
        '.bar { color: red }',
        'screen and (min-width: 200px)',
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([['./style-24-1.css', '.foo { color: red }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #7', () => {
    const update = injectStylesIntoStyleTag([
      ['./style-25-1.css', '.foo { color: red }', ''],
      ['./style-25-2.css', '.bar { color: blue }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([
      ['./style-25-1.css', '.foo { color: green }', ''],
      ['./style-25-2.css', '.bar { color: black }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #8', () => {
    const update = injectStylesIntoStyleTag([
      [
        './style-26-1.css',
        '.foo { color: red }',
        'screen and (min-width: 320px)',
        {
          version: 3,
          sources: ['style-26-1.css'],
          names: [],
          mappings: 'AAAA,cAAqB,eAAe,EAAE',
          file: 'style-26-1.css',
          sourcesContent: [
            '@media screen and (max-width: 320px) { .foo { color: red } }',
          ],
        },
      ],
      [
        './style-26-2.css',
        '.bar { color: yellow }',
        'screen and (max-width: 240px)',
        {
          version: 3,
          sources: ['style-26-2.css'],
          names: [],
          mappings: 'AAAA,cAAqB,eAAe,EAAE',
          file: 'style-26-2.css',
          sourcesContent: [
            '@media screen and (max-width: 240px) { .bar { color: yellow } }',
          ],
        },
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([
      [
        './style-26-1.css',
        '.foo { color: black }',
        'screen and (min-width: 640px)',
        {
          version: 3,
          sources: ['style-26-1.css'],
          names: [],
          mappings: 'BBBB,cAAqB,eAAe,EAAE',
          file: 'style-26-1.css',
          sourcesContent: [
            '@media screen and (min-width: 640px) { .foo { color: black } }',
          ],
        },
      ],
      [
        './style-26-2.css',
        '.bar { color: black }',
        'screen and (max-width: 1240px)',
        {
          version: 3,
          sources: ['style-26-2.css'],
          names: [],
          mappings: 'BBBB,cAAqB,eAAe,EAAE',
          file: 'style-26-2.css',
          sourcesContent: [
            '@media screen and (max-width: 1240px) { .bar { color: black } }',
          ],
        },
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #9', () => {
    const update = injectStylesIntoStyleTag([
      ['./style-27.css', '.foo { color: red }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([
      ['./style-27.css', '.foo { color: black }', ''],
      ['./style-27.css', '.foo { color: red }', ''],
      ['./style-27.css', '.foo { color: yellow }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #10', () => {
    const update = injectStylesIntoStyleTag(
      [
        ['./style-28-1.css', '.foo { color: red }', ''],
        ['./style-28-2.css', '.bar { color: blue }', ''],
      ],
      {
        insert: insertAtTop,
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([
      ['./style-28-1.css', '.foo { color: black }', ''],
      ['./style-28-2.css', '.bar { color: white }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    // eslint-disable-next-line no-underscore-dangle
    window._lastElementInsertedByStyleLoader = null;
  });

  it('should work with updates #11', () => {
    document.head.innerHTML =
      '<title>Title</title><script src="https://example.com/script.js" id="id"></script>';

    const update = injectStylesIntoStyleTag(
      [
        ['./style-29-1.css', '.foo { color: red }', ''],
        ['./style-29-2.css', '.bar { color: blue }', ''],
      ],
      {
        insert: insertBeforeAt,
      }
    );

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([
      ['./style-29-1.css', '.foo { color: black }', ''],
      ['./style-29-2.css', '.bar { color: white }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #12', () => {
    const update = injectStylesIntoStyleTag([
      ['./order-1.css', '.order { color: red }', ''],
      [
        './order.css',
        '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
        '',
      ],
      ['./order-2.css', '.order { color: blue }', ''],
      [
        './order.css',
        '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
        '',
      ],
      ['./order-1.css', '.order { color: red }', ''],
      [
        './order.css',
        '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
        '',
      ],
      [
        './order-2.css',
        '.order { color: blue }',
        'screen and (min-width: 2000px)',
      ],
      [
        './order.css',
        '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
        '',
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([
      ['./order-1.css', '.order { color: orange }', ''],
      [
        './order.css',
        '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
        '',
      ],
      ['./order-2.css', '.order { color: blue }', ''],
      [
        './order.css',
        '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
        '',
      ],
      ['./order-1.css', '.order { color: orange }', ''],
      [
        './order.css',
        '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
        '',
      ],
      [
        './order-2.css',
        '.order { color: blue }',
        'screen and (min-width: 2000px)',
      ],
      [
        './order.css',
        '.@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");',
        '',
      ],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #12', () => {
    const update = injectStylesIntoStyleTag([
      ['./style-30.css', '.foo { color: red }', ''],
      ['./style-31.css', '.bar { color: blue }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #13', () => {
    const update1 = injectStylesIntoStyleTag([
      ['./style-32.css', '.red { color: red }', ''],
    ]);
    const update2 = injectStylesIntoStyleTag([
      ['./style-33.css', '.green { color: green }', ''],
    ]);
    const update3 = injectStylesIntoStyleTag([
      ['./style-34.css', '.blue { color: blue }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update1([['./style-32.css', '.red { color: black }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update2([['./style-33.css', '.green { color: black }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update3([['./style-34.css', '.blue { color: black }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update1();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update2();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update3();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with updates #14', () => {
    const update1 = injectStylesIntoStyleTag([
      ['./style-35.css', '.red { color: red }', ''],
    ]);
    const update2 = injectStylesIntoStyleTag([
      ['./style-36.css', '.green { color: green }', ''],
    ]);
    const update3 = injectStylesIntoStyleTag([
      ['./style-37.css', '.blue { color: blue }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update2([['./style-36.css', '.green { color: black }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    injectStylesIntoStyleTag([
      ['./style-38.css', '.white { color: white }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update1();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update3();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('issue 447', () => {
    injectStylesIntoStyleTag({});

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('issue 447 #2', () => {
    const update = injectStylesIntoStyleTag({});

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update({});

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with empty modules list', () => {
    const update = injectStylesIntoStyleTag([]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work without modules', () => {
    const update = injectStylesIntoStyleTag();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with empty modules list #2', () => {
    const update = injectStylesIntoStyleTag();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([['./style-39.css', '.foo { color: red }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should work with empty modules list #3', () => {
    const update = injectStylesIntoStyleTag();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update([['./style-40.css', '.foo { color: red }', '']]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();

    update();

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });

  it('should avoid duplicate modules', () => {
    injectStylesIntoStyleTag([
      ['./style-41.css', '.foo { color: yellow }', ''],
      ['./style-42.css', '.bar { color: red }', ''],
    ]);
    injectStylesIntoStyleTag([
      ['./style-41.css', '.foo { color: yellow }', ''],
      ['./style-43.css', '.baz { color: blue }', ''],
    ]);

    expect(document.documentElement.innerHTML).toMatchSnapshot();
  });
});
