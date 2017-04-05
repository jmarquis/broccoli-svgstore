'use strict';

var fs = require('fs');
var objectAssign = require('object-assign');
var path = require('path');
var mkdirp = require('mkdirp');
var CachingWriter = require('broccoli-caching-writer');
var helpers = require('broccoli-kitchen-sink-helpers');
var svgstore = require('svgstore');
var assert = require('assert');

var defaultSettings = {
  outputFile: '/images.svg',
  annotation: 'SVGStore Processor',
  svgstoreOpts: {},
};

// TOOD: Perhaps be a bit more robust (and thus, more explicit about the proper API) with validation
var validationErrorPrefix = 'Expected a non-falsey argument for `_inputNode`, got ';

function SvgProcessor(_inputNode, _options) {
  if (!(this instanceof SvgProcessor)) {
    return new SvgProcessor(_inputNode, _options);
  }

  var options = objectAssign({}, defaultSettings, _options);
  if (options.name != null) {
    this._name = options.name;
  } else {
    this._name = (this.constructor && this.constructor.name != null) ? this.constructor.name : 'SVGStore';
  }
  this._annotation = options.annotation;
  this._options = options;

  var label = this._name + ' (' + this._annotation + ')';
  if (!_inputNode) {
    throw new TypeError(label + ': ' + validationErrorPrefix + _inputNode);
  }

  var inputNodes = Array.isArray(_inputNode) ? _inputNode : [_inputNode];

  CachingWriter.call(this, inputNodes, this._options);
}

SvgProcessor.prototype = Object.create(CachingWriter.prototype);
SvgProcessor.prototype.constructor = SvgProcessor;
SvgProcessor.prototype.description = 'svgstore';

/**
 * Overrides broccoli-plugin's `build' function.
 * @see: https://github.com/broccolijs/broccoli-plugin#pluginprototypebuild
 */
SvgProcessor.prototype.build = function() {

  var svgOutput = svgstore(this._options.svgstoreOpts);
  var fileSettings = this._options.fileSettings || {};

  try {
    // iterate through `inputPaths` of our `inputNodes` (`inputPaths` is an array of
    // paths on disk corresponding to each node in `inputNodes`)
    for (var i = 0, l = this.inputPaths.length; i < l; i++) {
      var srcDir = this.inputPaths[i];
      var inputFiles = helpers.multiGlob(["**/*.svg"], { cwd: srcDir });

      for (var j = 0, ll = inputFiles.length; j < ll; j++) {
        var inputFileName = inputFiles[j];
        var inputFilePath = path.join(srcDir, inputFileName);
        var stat = fs.statSync(inputFilePath);

        if (stat && stat.isFile()) {
          var fileNameWithoutExtension = inputFileName.replace(/\.[^\.]+$/, '');
          var fileContents = fs.readFileSync(inputFilePath, { encoding: 'utf8' });
          var inputFileSettings = fileSettings[fileNameWithoutExtension] || {};
          var svgId = inputFileSettings.id || fileNameWithoutExtension;
          var fileSVGStoreOpts = inputFileSettings.svgstoreOpts || {};

          svgOutput.add(svgId, fileContents, fileSVGStoreOpts);
        }
      }
    }
  } catch (error) {
    if (!error.message.match("did not match any files")) {
      throw error;
    }
  }

  assert(path.isAbsolute(this.outputPath), 'output path must be absolute'); // ❓❓ QUESTION: Necessary?

  var outputDestination = path.join(this.outputPath, this._options.outputFile);

  mkdirp.sync(path.dirname(outputDestination));

  return fs.writeFileSync(outputDestination, svgOutput.toString());
};

module.exports = SvgProcessor;
