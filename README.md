<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>Style Loader</h1>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]
[![chat][chat]][chat-url]
[![size][size]][size-url]

# style-loader

Adds CSS to the DOM.

## Getting Started

To begin, you'll need to install `css-loader`:

```console
npm install --save-dev style-loader
```

It's recommended to combine `style-loader` with the [`css-loader`](https://github.com/webpack-contrib/css-loader)

Then add the loader to your `webpack` config. For example:

**style.css**

```css
body {
  background: green;
}
```

**component.js**

```js
import style from './style.css';
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
};
```

### `Locals (CSS Modules)`

When using [local scoped CSS](https://github.com/webpack/css-loader#css-scope) the module exports the generated identifiers (locals):

**component.js**

```js
import style from './file.css';

style.className === 'z849f98ca812';
```

## Options

|       Name       |         Type         |  Default   | Description                                        |
| :--------------: | :------------------: | :--------: | :------------------------------------------------- |
| **`injectType`** |      `{String}`      | `styleTag` | Allows to setup how styles will be injected in DOM |
| **`attributes`** |      `{Object}`      |    `{}`    | Add custom attributes to tag                       |
|  **`insertAt`**  |  `{String\|Object}`  |  `bottom`  | Inserts tag at the given position                  |
| **`insertInto`** | `{String\|Function}` |  `<head>`  | Inserts tag into the given position                |
|    **`base`**    |      `{Number}`      |   `true`   | Set module ID base (DLLPlugin)                     |

### `injectType`

Type: `String`
Default: `styleTag`

Allows to setup how styles will be injected in DOM.

Possible values:

- `styleTag`
- `singletonStyleTag`
- `lazyStyleTag`
- `lazySingletonStyleTag`
- `linkTag`

When you `lazyStyleTag` or `lazySingletonStyleTag` value the `style-loader` injects the styles lazily making them useable on-demand via `style.use()` / `style.unuse()`.

**component.js**

```js
import style from './file.css';

style.use();
style.unuse();
```

We recommend following `.lazy.css` naming convention for lazy styles and the `.css` for basic `style-loader` usage (similar to other file types, i.e. `.lazy.less` and `.less`).

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        exclude: /\.lazy\.css$/i,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
      {
        test: /\.lazy\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              // Can be `'lazyStyleTag'` or `'lazySingletonStyleTag'`
              injectType: 'lazyStyleTag',
            },
          },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

Styles are not added on `import/require()`, but instead on call to `use`. Styles are removed from page if `unuse` is called exactly as often as `use`.

> ⚠️ Behavior is undefined when `unuse` is called more often than `use`. Don't do that.

#### `styleTag`

Injects styles in multiple `<style></style>`. It is **default** behaviour.

```js
import './styles.css';
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          { loader: 'style-loader', options: { injectType: 'styleTag' } },
          'css-loader',
        ],
      },
    ],
  },
};
```

The loader inject styles like:

```html
<style>
  .foo {
    color: red;
  }
</style>
<style>
  .bar {
    color: blue;
  }
</style>
```

#### `singletonStyleTag`

Injects styles in one `<style></style>`.

```js
import './styles.css';
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: { injectType: 'singletonStyleTag' },
          },
          'css-loader',
        ],
      },
    ],
  },
};
```

The loader inject styles like:

```html
<style>
  .foo {
    color: red;
  }
  .bar {
    color: blue;
  }
</style>
```

#### `lazyStyleTag`

Injects styles in multiple `<style></style>` on demand (documentation above).

```js
import styles from './styles.css';

styles.use();
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.lazy\.css$/i,
        use: [
          { loader: 'style-loader', options: { injectType: 'lazyStyleTag' } },
          'css-loader',
        ],
      },
    ],
  },
};
```

The loader inject styles like:

```html
<style>
  .foo {
    color: red;
  }
</style>
<style>
  .bar {
    color: blue;
  }
</style>
```

#### `lazySingletonStyleTag`

Injects styles in one `<style></style>` on demand (documentation above).

```js
import styles from './styles.css';

styles.use();
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.lazy\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: { injectType: 'lazySingletonStyleTag' },
          },
          'css-loader',
        ],
      },
    ],
  },
};
```

The loader generate this:

```html
<style>
  .foo {
    color: red;
  }
  .bar {
    color: blue;
  }
</style>
```

#### `linkTag`

Injects styles in multiple `<link rel="stylesheet" href="path/to/file.css">` .

```js
import './styles.css';
import './other-styles.css';
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          { loader: 'style-loader', options: { injectType: 'linkTag' } },
          { loader: 'file-loader' },
        ],
      },
    ],
  },
};
```

The loader generate this:

```html
<link rel="stylesheet" href="path/to/style.css" />
<link rel="stylesheet" href="path/to/other-styles.css" />
```

### `attributes`

Type: `Object`
Default: `{}`

If defined, style-loader will attach given attributes with their values on `<style>` / `<link>` element.

**component.js**

```js
import style from './file.css';
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          { loader: 'style-loader', options: { attributes: { id: 'id' } } },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

```html
<style id="id"></style>
```

### `insertAt`

By default, the style-loader appends `<style>` elements to the end of the style target, which is the `<head>` tag of the page unless specified by `insertInto`. This will cause CSS created by the loader to take priority over CSS already present in the target. To insert style elements at the beginning of the target, set this query parameter to 'top', e.g

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              insertAt: 'top',
            },
          },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

A new `<style>` element can be inserted before a specific element by passing an object, e.g.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              insertAt: {
                before: '#id',
              },
            },
          },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

### `insertInto`

By default, the style-loader inserts the `<style>` elements into the `<head>` tag of the page. If you want the tags to be inserted somewhere else you can specify a CSS selector for that element here. If you target an [IFrame](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement) make sure you have sufficient access rights, the styles will be injected into the content document head.

You can also pass function to override default behavior and insert styles in your container, e.g

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              insertInto: () => document.querySelector('#root'),
            },
          },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

Using function you can insert the styles into a [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot), e.g

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              insertInto: () => document.querySelector('#root').shadowRoot,
            },
          },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

### `base`

This setting is primarily used as a workaround for [css clashes](https://github.com/webpack-contrib/style-loader/issues/163) when using one or more [DllPlugin](https://robertknight.github.io/posts/webpack-dll-plugins/)'s. `base` allows you to prevent either the _app_'s css (or _DllPlugin2_'s css) from overwriting _DllPlugin1_'s css by specifying a css module id base which is greater than the range used by _DllPlugin1_ e.g.:

**webpack.dll1.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
          },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

**webpack.dll2.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          { loader: 'style-loader', options: { base: 1000 } },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

**webpack.app.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          { loader: 'style-loader', options: { base: 2000 } },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

## Examples

### Source maps

The loader automatically inject source maps when previous loader emit them.
Therefore, to generate source maps, set the `sourceMap` option to `true` for the previous loader.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { sourceMap: true } },
        ],
      },
    ],
  },
};
```

### Nonce

There are two ways to work with `nonce`:

- using the `attirbutes` option
- using the `__webpack_nonce__` variable

> ⚠ the `__webpack_nonce__` variable takes precedence over the `attibutes` option, so if define the `__webpack_nonce__` variable the `attributes` option will not be used

### `attirbutes`

**component.js**

```js
import './style.css';
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              attributes: {
                nonce: '12345678',
              },
            },
          },
          'css-loader',
        ],
      },
    ],
  },
};
```

The loader generate:

```html
<style nonce="12345678">
  .foo {
    color: red;
  }
</style>
```

### `__webpack_nonce__`

**create-nonce.js**

```js
__webpack_nonce__ = '12345678';
```

**component.js**

```js
import './create-nonce.js';
import './style.css';
```

Alternative example for `require`:

**component.js**

```js
__webpack_nonce__ = '12345678';

require('./style.css');
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
```

The loader generate:

```html
<style nonce="12345678">
  .foo {
    color: red;
  }
</style>
```

## Contributing

Please take a moment to read our contributing guidelines if you haven't yet done so.

[CONTRIBUTING](./.github/CONTRIBUTING.md)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/style-loader.svg
[npm-url]: https://npmjs.com/package/style-loader
[node]: https://img.shields.io/node/v/style-loader.svg
[node-url]: https://nodejs.org
[deps]: https://david-dm.org/webpack-contrib/style-loader.svg
[deps-url]: https://david-dm.org/webpack-contrib/style-loader
[tests]: https://dev.azure.com/webpack-contrib/style-loader/_apis/build/status/webpack-contrib.style-loader?branchName=master
[tests-url]: https://dev.azure.com/webpack-contrib/style-loader/_build/latest?definitionId=18&branchName=master
[cover]: https://codecov.io/gh/webpack-contrib/style-loader/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/style-loader
[chat]: https://badges.gitter.im/webpack/webpack.svg
[chat-url]: https://gitter.im/webpack/webpack
[size]: https://packagephobia.now.sh/badge?p=style-loader
[size-url]: https://packagephobia.now.sh/result?p=style-loader
