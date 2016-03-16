broccoli-svgstore
=================

A simple [Broccoli](https://github.com/broccolijs/broccoli) task to combine SVG files as described in [a recent CSS Tricks article](http://css-tricks.com/svg-sprites-use-better-icon-fonts/) for SVG sprite-based icon systems. Comparable to [grunt-svgstore](https://github.com/FWeinb/grunt-svgstore) and [gulp-svgstore](https://github.com/w0rm/gulp-svgstore). Heavily inspired by [broccoli-concat](https://github.com/rlivsey/broccoli-concat).


Installation
------------

```
npm install broccoli-svgstore --save
```


Usage
-----

The filter accepts one input tree full of SVG files and outputs a tree with a single file as named by the `outputFile` option.

```javascript
var svgstore = require("broccoli-svgstore");

var outputTree = svgstore(inputTree, {
  outputFile: "/assets/icons.svg",
  prefix: "" // prefix for the `id` attribute on the generated `symbol`s in the `ouputFile`
});
```

Inject the file into an HTML document and use `<svg><use xlink:href="icon-name"></svg>` to place an image on the page.


Notes
-----

This was created in a couple of hours to take SVGs from Sketch to a webapp using Broccoli. Options are pretty sparse, there are no tests, and no other use cases have been considered so far. It's little more than a proof-of-concept in its current state.

Pull requests welcome. Please try to keep things consistent with the philosophy of Broccoli & the spirit of the surrounding plugin community.


Version History
---------------

### v0.1.0
initial release
