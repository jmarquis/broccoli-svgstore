'use strict';

var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var cheerio = require('cheerio');

var svgToSymbol = require('../utils/svg-to-symbol');

var BASE_SYMBOL_ATTRS = ['id', 'viewBox', 'aria-labelledby', 'role'];

var FILE_PATHS = {
  goodSVG: path.normalize('fixtures/input/utils_tests/icon-smiley.svg'),
  malformedSVG: {
    noClosingSVGTag: path.normalize('fixtures/input/utils_tests/malformed-svgs/no-closing-svg-tag.svg')
  },
  extraAttrsSVG: path.normalize('fixtures/input/utils_tests/extra_attrs/extra-attrs-example.svg')
};

function getContents(filePath) {
  return fs.readFileSync(filePath, { encoding: 'utf8' });
}

function setup(filePath, opts) {
  fileContents = getContents(filePath);
  outputHTML = svgToSymbol(filePath, fileContents, opts);
  $ = cheerio.load(outputHTML, { xmlMode: true });
  $symbol = $('symbol'); 
}

var filePath, fileContents, outputHTML, $, $symbol;

describe('#svgToSymbol utility', function() {

  describe('making a symbol from the contents of an svg file', function() {
    
    before(function() {
      filePath = path.join(__dirname, FILE_PATHS.goodSVG);
      setup(filePath);
    });

    it('produces a valid `symbol` HTML element', function() {
      expect($symbol[0].tagName).to.equal('symbol');
    });
        
    it('applies a proper viewBox when one exists on the original SVG', function() {
      expect($symbol.attr('viewBox')).to.be.a.string;
      expect($symbol.attr('viewBox').split(' ')).to.have.length(4);
    });

    it('uses the filename as the symbol id', function() {
      expect($symbol.attr('id')).to.be.a.string;
      expect($symbol.attr('id')).to.equal('icon-smiley');
    });   
  });

  describe('handling malformed SVG', function() {

    before(function() {
      filePath = path.join(__dirname, FILE_PATHS.malformedSVG.noClosingSVGTag);
    });    
        
    it('properly parses SVGs without a closing SVG tag', function() {
      setup(filePath);

      expect($symbol[0].tagName).to.equal('symbol');
      expect($symbol.attr('id')).to.equal('no-closing-svg-tag');
    });

    // TODO: What sort of malformed-cases does the current impelmentation 
    // already work smoothly with? Just how robust do we want to be in the first place? 
  });

  describe('configuring the attributes applied to symbols', function() {
    
    before(function() {
      filePath = path.join(__dirname, FILE_PATHS.extraAttrsSVG);
    });

    function testBaseAttributes() {
      expect($symbol.attr('id')).to.equal('extra-attrs-example');
      expect($symbol.attr('viewBox')).to.equal('0 0 100 100');
      expect($symbol.attr('aria-labelledby')).to.equal('titleId descriptionId');
      expect($symbol.attr('role')).to.equal('img');
    }

    it('attempts to apply ' + BASE_SYMBOL_ATTRS + ' to the symbol by default', function() {
      setup(filePath);
      
      testBaseAttributes();  
      expect($symbol.attr('width')).to.be.undefined;
      expect($symbol.attr('height')).to.be.undefined;    
    });

    it('attempts to apply any attributes configured as `extraAttrs', function() {
      setup(filePath, { extraAttrs: ['width', 'height'] });

      testBaseAttributes();
      expect($symbol.attr('width')).to.equal('100%');
      expect($symbol.attr('height')).to.equal('100%');
    });


    it('dedupes applied attributes', function() {
      setup(filePath, {
        extraAttrs: ['width', 'width', 'width', 'height', 'height', 'height']
      });

      testBaseAttributes();
      expect($symbol.attr('width')).to.equal('100%');
      expect($symbol.attr('height')).to.equal('100%');

      var symbolString = $symbol._root.html();
      var symbolTagString = symbolString.slice(
        symbolString.indexOf('<symbol'),
        symbolString.indexOf('>')
      );

      expect(symbolTagString.match(/width=".*"/g)).to.have.length(1);
      expect(symbolTagString.match(/height=".*"/g)).to.have.length(1);

    });
       
    it('only applies an attribute to the symbol if it exists on the original `svg` tag', function() {
      setup(filePath, {
        extraAttrs: ['width', 'height', 'foo']
      });

      testBaseAttributes();
      expect($symbol.attr('width')).to.equal('100%');
      expect($symbol.attr('height')).to.equal('100%');
      expect($symbol.attr('foo')).to.be.undefined;
    });
  });

});