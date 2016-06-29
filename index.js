'use strict';

var fs = require('fs');
var merge = require('merge');
var path = require('path');
var mkdirp = require('mkdirp');
var CachingWriter = require('broccoli-caching-writer');
var helpers = require('broccoli-kitchen-sink-helpers');

var svgToSymbol = require('./utils/svg-to-symbol');

var defaultSettings = {
  outputFile: '/images.svg',
  annotation: 'SVGStore Processor'
};

// TOOD: Perhaps be a bit more robust (and thus, more explicit about the proper API) with validation
var validationErrorPrefix = 'Expected a non-falsey argument for `_inputNode`, got ';

function SvgProcessor(_inputNode, _options) {
  if (!(this instanceof SvgProcessor)) {
    return new SvgProcessor(_inputNode, _options);
  }

  var options = merge(defaultSettings, _options);
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
module.exports = SvgProcessor;


SvgProcessor.prototype.build = function () {

  var output = ['<svg xmlns="http://www.w3.org/2000/svg" style="display: none">'];

  try {
    var srcDir, inputFiles, inputFilePath, stat;
    for (var i = 0; i < this.inputPaths.length; i++) {
      srcDir = this.inputPaths[i];
      inputFiles = helpers.multiGlob(["**/*.svg"], { cwd: srcDir });

      for (var j = 0; j < inputFiles.length; j++) {
        inputFilePath = path.join(srcDir, inputFiles[j]);
        stat = fs.statSync(inputFilePath);

        if (stat && stat.isFile()) {
          var fileContents = fs.readFileSync(inputFilePath, { encoding: 'utf8' });
          output.push(svgToSymbol(inputFilePath, fileContents));
        }
      }
    }
  } catch (error) {
    if (!error.message.match("did not match any files")) {
      throw error;
    }
  }

  output.push("</svg>");

  helpers.assertAbsolutePaths([this.outputPath]); // TODO: Necessary?

  var concatenatedOutput = output.join("\n");
  var outputDestination = path.join(this.outputPath, this._options.outputFile);

  mkdirp.sync(path.dirname(outputDestination));

  return fs.writeFileSync(outputDestination, concatenatedOutput);
};
