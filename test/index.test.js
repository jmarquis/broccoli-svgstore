'use strict';

var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var BroccoliCachingWriter = require('broccoli-caching-writer');
var broccoli = require('broccoli');
var cheerio = require('cheerio');

var SvgProcessor = require('..');
var SOURCE_DIR_GROUP_1 = path.normalize('test/fixtures/input/group-1');
var SOURCE_DIR_GROUP_2 = path.normalize('test/fixtures/input/group-2');
var SOURCE_DIR_SVGSTORE_OPTS = path.normalize('test/fixtures/input/standalone-svgs/svgstore-opts');

var OUTPUT_FILE = path.normalize('test/fixtures/output/test-symbols.html');
var ANNOTATION = 'testing processor';

var DEFAULT_OPTS = {
  annotation: ANNOTATION,
  outputFile: OUTPUT_FILE
};

// KEY ids on their unique source file paths
var ID_MANIFEST = {};
ID_MANIFEST[SOURCE_DIR_GROUP_1] = ['icon-circles', 'icon-triangle', 'icon-star', 'icon-spark'];
ID_MANIFEST[SOURCE_DIR_GROUP_2] = ['icon-square', 'icon-smiley', 'icon-movie-ticket'];
ID_MANIFEST[SOURCE_DIR_SVGSTORE_OPTS] = ['svgstore-opts'];

function makeBuilderFromInputNodes(inputNodes, options) {
  var options = options || {};
  var svgProcessor = new SvgProcessor(inputNodes, {
    outputFile: options.outputFile || OUTPUT_FILE,
    annotation: options.annotation || 'SVGStore Processor -- Tests',
    svgstoreOpts: options.svgstoreOpts || {},
    fileSettings: options.fileSettings || {},
    prefix: options.prefix
  });

  return new broccoli.Builder(svgProcessor);
}

function loadSVG(filePath) {
  var fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
  return cheerio.load(fileContent, { xmlMode: true });
}

function testForSymbols($loadedSVG, expectedSymbolIds) {
  // test proper structure
  var $svg = $loadedSVG('svg');

  var svgElem = $svg[0];
  expect(svgElem.name).to.equal('svg');
  expect(svgElem.type).to.equal('tag');

  // test symbols (NOTE: this is cheerio's jQuery-style `filter`, so... idx and elem are backwards 😎)
  var symbols = $svg.children().filter(function (idx, elem) {
    return elem.name && elem.name === 'symbol';
  });

  expect(symbols.length).to.equal(expectedSymbolIds.length);

  expectedSymbolIds.forEach(function (id, idx) {
    var $symbol = $loadedSVG('svg #' + id).first();
    expect($symbol[0].tagName).to.equal('symbol');
    expect($symbol.attr('id')).to.equal(id);
  });
}


var svgProcessor, builder;

describe('SVGProcessor', function () {

  afterEach(function() {
    if (builder) {
      return builder.cleanup();
    }
  });

  describe('construction', function() {

    it('extends `broccoli-caching-writer`', function() {
      svgProcessor = new SvgProcessor([SOURCE_DIR_GROUP_1], DEFAULT_OPTS);
      expect(svgProcessor).to.be.an.instanceof(BroccoliCachingWriter);
    });

    it('throws on falsey `inputNodes`', function () {
      function TestProcessor(inputNodes, options) {
        options = options || DEFAULT_OPTS;
        SvgProcessor.call(this, inputNodes, options);
      }
      TestProcessor.prototype = Object.create(SvgProcessor.prototype);
      TestProcessor.prototype.constructor = TestProcessor;
      TestProcessor.prototype.build = function() {};

      var errorMsgPrefix = 'TestProcessor (' + ANNOTATION + '): Expected a non-falsey argument for `_inputNode`, got ';

      expect(function() {
        new TestProcessor();
      }).to.throw(TypeError, errorMsgPrefix + 'undefined');

      expect(function() {
        new TestProcessor(null);
      }).to.throw(TypeError, errorMsgPrefix + 'null');

      expect(function() {
        new TestProcessor(undefined);
      }).to.throw(TypeError, errorMsgPrefix + 'undefined');

      expect(function() {
        new TestProcessor(false);
      }).to.throw(TypeError, errorMsgPrefix + 'false');
    });
  });


  describe('build', function() {

    it('writes all SVGs in a single directory to the target outputFile', function() {
      var inputNodes = [SOURCE_DIR_GROUP_1];
      builder = makeBuilderFromInputNodes(inputNodes);

      return builder.build().then(function(results) {
        var outputDestination = path.join(results.directory, path.normalize(OUTPUT_FILE));

        testForSymbols(loadSVG(outputDestination), ID_MANIFEST[SOURCE_DIR_GROUP_1]);
      });
    });

    it('writes all SVGs from a list of directories to the target outputFile', function() {
      var inputNodes = [SOURCE_DIR_GROUP_1, SOURCE_DIR_GROUP_2];
      builder = makeBuilderFromInputNodes(inputNodes);

      return builder.build().then(function(results) {
        var outputDestination = path.join(results.directory, path.normalize(OUTPUT_FILE));
        var symbolIds = ID_MANIFEST[SOURCE_DIR_GROUP_1].concat(ID_MANIFEST[SOURCE_DIR_GROUP_2]);

        testForSymbols(loadSVG(outputDestination), symbolIds);
      });
    });

    it('passes options to SVGStore', function() {
      var inputNode = SOURCE_DIR_SVGSTORE_OPTS;
      var svgstoreOpts = {
        svgAttrs: { 'x-custom-svg-attr': 'red' },
        symbolAttrs: { 'x-custom-symbol-attr': 'blue' },
        copyAttrs: ['x-copied-symbol-attr']
      };

      builder = makeBuilderFromInputNodes(inputNode, { svgstoreOpts: svgstoreOpts });

      return builder.build().then(function (results) {
        var outputDestination = path.join(results.directory, path.normalize(OUTPUT_FILE));
        var symbolId = ID_MANIFEST[SOURCE_DIR_SVGSTORE_OPTS];

        var $ = loadSVG(outputDestination);
        testForSymbols($, symbolId);

        expect($('svg').attr('x-custom-svg-attr')).to.equal(svgstoreOpts.svgAttrs['x-custom-svg-attr']);
        expect($('symbol').attr('x-custom-symbol-attr')).to.equal(svgstoreOpts.symbolAttrs['x-custom-symbol-attr']);
        expect($('symbol').attr('x-copied-symbol-attr')).to.equal(svgstoreOpts.copyAttrs['x-copied-symbol-attr']);
      });
    });

    it('enables per-file configuration via a `fileSettings` hash', function() {
      var inputNodes = [SOURCE_DIR_GROUP_1];
      var customIDs = ['customID-1', 'customID-2', 'customID-3'];
      var fileSettings = {
        [ID_MANIFEST[SOURCE_DIR_GROUP_1][0]]: { id: customIDs[0] },
        [ID_MANIFEST[SOURCE_DIR_GROUP_1][1]]: { id: customIDs[1] },
        [ID_MANIFEST[SOURCE_DIR_GROUP_1][2]]: { id: customIDs[2] }
      };

      builder = makeBuilderFromInputNodes(inputNodes, { fileSettings });

      return builder.build().then(function (results) {
        var outputDestination = path.join(results.directory, path.normalize(OUTPUT_FILE));
        var symbolIds = customIDs.concat(ID_MANIFEST[SOURCE_DIR_GROUP_1][3]);

        var $ = loadSVG(outputDestination);
        testForSymbols($, symbolIds);
      });
    });

    it('prefixes all ids in the target outputFile if a prefix option is passed', function() {
      var inputNodes = [SOURCE_DIR_GROUP_1];
      var prefix = 'custom-prefix-';
      builder = makeBuilderFromInputNodes(inputNodes, { prefix });

      return builder.build().then(function(results) {
        var outputDestination = path.join(results.directory, path.normalize(OUTPUT_FILE));
        var symbolIds = ID_MANIFEST[SOURCE_DIR_GROUP_1].map(function (id) {
          return prefix + id;
        });

        testForSymbols(loadSVG(outputDestination), symbolIds);
      });
    });

    it('per-file configurations overide prefix', function() {
      var inputNodes = [SOURCE_DIR_GROUP_1];
      // set a custom id for the second one
      var customID = 'customID-2';
      var fileSettings = {
        [ID_MANIFEST[SOURCE_DIR_GROUP_1][1]]: { id: customID },
      };
      // prefix all others
      var prefix = 'custom-prefix-';

      builder = makeBuilderFromInputNodes(inputNodes, { fileSettings, prefix });

      return builder.build().then(function (results) {
        var outputDestination = path.join(results.directory, path.normalize(OUTPUT_FILE));
        var symbolIds = ID_MANIFEST[SOURCE_DIR_GROUP_1].map(function (id) {
          return prefix + id;
        });
        symbolIds[1] = customID;

        var $ = loadSVG(outputDestination);
        testForSymbols($, symbolIds);
      });
    });
  });
});
