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

Adds CSS to the DOM by injecting a <code>&lt;style&gt;</code> tag

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

### `Url`

It's also possible to add a URL `<link href="path/to/file.css" rel="stylesheet">` instead of inlining the CSS `{String}` with `<style></style>` tag.

```js
import url from 'file.css';
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader/url' }, { loader: 'file-loader' }],
      },
    ],
  },
};
```

```html
<link rel="stylesheet" href="path/to/file.css" />
```

### `Useable`

The `style-loader` injects the styles lazily making them useable on-demand via `style.use()` / `style.unuse()`

By convention the `Reference Counter API` should be bound to `.useable.css` and the `.css` should be loaded with basic `style-loader` usage.(similar to other file types, i.e. `.useable.less` and `.less`).

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /\.useable\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
      {
        test: /\.useable\.css$/,
        use: [
          {
            loader: 'style-loader/useable',
          },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

#### `Reference Counter API`

**component.js**

```js
import style from './file.css';

style.use(); // = style.ref();
style.unuse(); // = style.unref();
```

Styles are not added on `import/require()`, but instead on call to `use`/`ref`. Styles are removed from page if `unuse`/`unref` is called exactly as often as `use`/`ref`.

> ⚠️ Behavior is undefined when `unuse`/`unref` is called more often than `use`/`ref`. Don't do that.

## Options

|       Name       |         Type         |   Default   | Description                                                                                                                    |
| :--------------: | :------------------: | :---------: | :----------------------------------------------------------------------------------------------------------------------------- |
|    **`hmr`**     |     `{Boolean}`      |   `true`    | Enable/disable Hot Module Replacement (HMR), if disabled no HMR Code will be added (good for non local development/production) |
|    **`base`**    |      `{Number}`      |   `true`    | Set module ID base (DLLPlugin)                                                                                                 |
| **`attributes`** |      `{Object}`      |    `{}`     | Add custom attributes to `<style></style>`                                                                                     |
| **`transform`**  |     `{Function}`     |   `false`   | Transform/Conditionally load CSS by passing a transform/condition function                                                     |
|  **`insertAt`**  |  `{String\|Object}`  |  `bottom`   | Inserts `<style></style>` at the given position                                                                                |
| **`insertInto`** | `{String\|Function}` |  `<head>`   | Inserts `<style></style>` into the given position                                                                              |
| **`singleton`**  |     `{Boolean}`      | `undefined` | Reuses a single `<style></style>` element, instead of adding/removing individual elements for each required module.            |
| **`sourceMap`**  |     `{Boolean}`      |   `false`   | Enable/Disable Sourcemaps                                                                                                      |

### `hmr`

Enable/disable Hot Module Replacement (HMR), if disabled no HMR Code will be added.
This could be used for non local development and production.

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
              hmr: false,
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
        test: /\.css$/,
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
        test: /\.css$/,
        use: [
          { loader: 'style-loader', options: { base: 2000 } },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

### `attributes`

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
        test: /\.css$/,
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

#### `Url`

**component.js**

```js
import link from './file.css';
```

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader/url', options: { attributes: { id: 'id' } } },
          { loader: 'file-loader' },
        ],
      },
    ],
  },
};
```

### `transform`

A `transform` is a function that can modify the css just before it is loaded into the page by the style-loader.
This function will be called on the css that is about to be loaded and the return value of the function will be loaded into the page instead of the original css.
If the return value of the `transform` function is falsy, the css will not be loaded into the page at all.

> ⚠️ In case you are using ES Module syntax in `tranform.js` then, you **need to transpile** it or otherwise it will throw an `{Error}`.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: 'style-loader',
        options: {
          transform: 'path/to/transform.js',
        },
      },
    ],
  },
};
```

**transform.js**

```js
module.exports = function(css) {
  // Here we can change the original css
  return css.replace('.classNameA', '.classNameB');
};
```

#### `Conditional`

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        loader: 'style-loader',
        options: {
          transform: 'path/to/conditional.js',
        },
      },
    ],
  },
};
```

**conditional.js**

```js
module.exports = function(css) {
  // If the condition is matched load [and transform] the CSS
  if (css.includes('something I want to check')) {
    return css;
  }

  // If a falsy value is returned, the CSS won't be loaded
  return false;
};
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

### `singleton`

If defined, the style-loader will reuse a single `<style></style>` element, instead of adding/removing individual elements for each required module.

> ℹ️ This option is on by default in IE9, which has strict limitations on the number of style tags allowed on a page. You can enable or disable it with the singleton option.

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          { loader: 'style-loader', options: { singleton: true } },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
```

### `sourceMap`

Enable/Disable source map loading

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          { loader: 'style-loader', options: { sourceMap: true } },
          { loader: 'css-loader', options: { sourceMap: true } },
        ],
      },
    ],
  },
};
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
