var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var BroccoliCachingWriter = require('broccoli-caching-writer');
var broccoli = require('broccoli');
var cheerio = require('cheerio');

var SvgProcessor = require('..');
var SOURCE_DIR_1 = path.normalize('test/fixtures/input/dir_1');
var SOURCE_DIR_2 = path.normalize('test/fixtures/input/dir_2');

var OUTPUT_FILE = path.normalize('test/fixtures/output/test-symbols.html');
var ANNOTATION = 'testing processor'; 

var DEFAULT_OPTS = {
  annotation: ANNOTATION,
  outputFile: OUTPUT_FILE
};

var ID_MANIFEST = {};
ID_MANIFEST[SOURCE_DIR_1] = ['icon-circles', 'icon-triangle', 'icon-star', 'icon-spark'];
ID_MANIFEST[SOURCE_DIR_2] = ['icon-square', 'icon-smiley', 'icon-movie-ticket'];

function makeBuilderFromInputNodes(inputNodes, options) {
  var svgProcessor = new SvgProcessor(inputNodes, {
    outputFile: OUTPUT_FILE
  });
  return new broccoli.Builder(svgProcessor); 
}

function testOutput(filePath, ids, attrs) {
  var fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
  var $ = cheerio.load(fileContent, { xmlMode: true });
  
  // test proper structure
  var $svgElem = $('svg').get(0);
  expect($svgElem.tagName).to.equal('svg');
  expect($svgElem.attribs.style).to.contain('display: none');


  // test symbols
  var symbols = $svgElem.children.filter(function (elem, idx) {
    return elem.name && elem.name === 'symbol';
  });

  expect(symbols.length).to.equal(ids.length);

  var $symbol;
  ids.forEach(function (id, idx) {
    $symbol = $('svg #' + id).first();
    expect($symbol[0].tagName).to.equal('symbol');
    expect($symbol.attr('id')).to.equal(id);
  });

  // TODO: if `attrs` passed, test for presence of attributes  
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
      svgProcessor = new SvgProcessor([SOURCE_DIR_1], DEFAULT_OPTS);
      expect(svgProcessor).to.be.an.instanceof(BroccoliCachingWriter);
    });

    it('throws on falsey `inputNodes`', function () {    
      function TestProcessor() {
        SvgProcessor.apply(this, arguments);
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

    it('writes all SVGs in a single directory to the target outputFile', function(done) {      
      var inputNodes = [SOURCE_DIR_1];
      builder = makeBuilderFromInputNodes(inputNodes);

      return builder.build().then(function(results) {
        var outputDestination = path.join(results.directory, path.normalize(OUTPUT_FILE));
        
        testOutput(outputDestination, ID_MANIFEST[SOURCE_DIR_1]);
        done();
      });    
    });

    it('writes all SVGs from a list of directories to the target outputFile', function(done) {
      var inputNodes = [SOURCE_DIR_1, SOURCE_DIR_2];
      builder = makeBuilderFromInputNodes(inputNodes);

      return builder.build().then(function(results) {
        var outputDestination = path.join(results.directory, path.normalize(OUTPUT_FILE));
        var symbolIds = ID_MANIFEST[SOURCE_DIR_1].concat(ID_MANIFEST[SOURCE_DIR_2]);  

        testOutput(outputDestination, symbolIds);
        done();
      });      
    });

  });



});

