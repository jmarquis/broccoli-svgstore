# broccoli-svgstore

[![Latest NPM release][npm-badge]][npm-badge-url]
[![CircleCI Build Status][circle-badge]][circle-badge-url]
[![License][license-badge]][license-badge-url]
[![Dependencies][dependencies-badge]][dependencies-badge-url]
[![Dev Dependencies][devDependencies-badge]][devDependencies-badge-url]


_A [Broccoli](https://github.com/broccolijs/broccoli) plugin built on top of
[`broccoli-caching-writer`](https://github.com/ember-cli/broccoli-caching-writer) that processes
SVGs with [`svgstore`](https://github.com/svgstore/svgstore)_


## Installation


```shell
npm install --save broccoli-svgstore
```

## Usage

`broccoli-svgstore` accepts an [`inputNode`](https://github.com/broccolijs/broccoli/blob/master/docs/node-api.md#part-2-node-api-specification) --
or a list of `inputNodes` -- and converts the contents of SVG files found within each node's directory root into
SVG `<symbol/>`s (processing them with [`svgstore`](https://github.com/svgstore/svgstore)).

The transformed content is then written into a single file (see: the [`outputFile` option](#option-outputFile)),
and returned as an output node of the Broccoli build processes.

```javascript
var svgstore = require("broccoli-svgstore");

var outputNode = svgstore(inputNodes, {
  outputFile: "/assets/icons.svg"
});
```

For a specific example, check out [`ember-cli-svgstore's` use of `broccoli-svgstore`](https://github.com/salsify/ember-cli-svgstore/blob/master/index.js)

Within your markup, you should now be able to "use" each symbol inside of other SVGs:

```html
<svg><use xlink:href="icon-doge"/></svg>
```

## API
- `inputNode|inputNodes` {inputNode or Array of inputNodes}: A standalone [Broccoli Node](https://github.com/broccolijs/broccoli/blob/master/docs/node-api.md), or a list of them.
  The root of each node's source directory will form the starting point for a recursive search of `.svg` files.

- `options` {Object}: [Options for `broccoli-svgstore`](#options)

### Options
- <a name="option-outputFile"></a>`outputFile` {string}: The name of the file -- including any directory
  path -- [to which output will be written](https://github.com/broccolijs/broccoli-plugin#pluginprototypebuild)
  (starting from the root directory of your build destination).

  Required: `true`

  Default: `null`

- `annotation` {string}: a [Broccoli Plugin annotation](https://github.com/broccolijs/broccoli-plugin#new-plugininputnodes-options)

  Required: `false`

  Default: `null`


- `svgstoreOpts` {Object}: Options to be passed on to `svgstore` during the processing step.
  - See: `svgstore`'s options [documentation](https://github.com/svgstore/svgstore#options)

  Required: `false`

  Default:
  ```js
    {
      svgAttrs: {
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink'
      }
    }
  ```

- `fileSettings` {Object}: a hash of per-file settings.
That is, each root key should correspond to a file name of an SVG that
will be found in this node. It's value should then be an Object with any of the following settings:
  + `id` {string}: A custom id to be used for this SVG's final `<symbol>`.
  + `svgstoreOpts` {Object}: same as `options.svgstoreOpts`, but scoped to the file

  Example usage:

  ```js
    var outputNode = svgstore(inputNodes, {
      outputFile: "/assets/icons.svg",
      fileSettings: {
        twitter: { id: 'icon-twitter' },
        menu: {
          id: 'icon-hamburger-menu',
          svgstoreOpts: {
            symbolAttrs: { preserveAspectRatio: 'xMinYMid' }
          }
        }
    });
  ```


[npm-badge]: https://img.shields.io/npm/v/broccoli-svgstore.svg
[npm-badge-url]: https://www.npmjs.com/package/broccoli-svgstore
[circle-badge]: https://circleci.com/gh/svgstore/broccoli-svgstore/tree/master.svg?style=svg&circle-token={{CIRCLE_TOKEN}}
[circle-badge-url]: https://circleci.com/gh/svgstore/broccoli-svgstore/tree/master
[license-badge]: https://img.shields.io/npm/l/broccoli-svgstore.svg
[license-badge-url]: LICENSE.md
[dependencies-badge]: https://david-dm.org/svgstore/broccoli-svgstore/status.svg
[dependencies-badge-url]: https://david-dm.org/svgstore/broccoli-svgstore
[devDependencies-badge]: https://david-dm.org/svgstore/broccoli-svgstore/dev-status.svg
[devDependencies-badge-url]: https://david-dm.org/svgstore/broccoli-svgstore#info=devDependencies
