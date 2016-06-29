'use strict';

var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var cheerio = require('cheerio');

var svgToSymbol = require('../utils/svg-to-symbol');

var FILE_PATHS = {
  goodSVG: path.normalize('fixtures/input/utils_tests/icon-smiley.svg'),
  malformedSVG: {
    noClosingSVGTag: path.normalize('fixtures/input/utils_tests/malformed-svgs/no-closing-svg-tag.svg')
  }
};

function getContents(filePath) {
  return fs.readFileSync(filePath, { encoding: 'utf8' });
}

function setup(filePath) {
  filePath = path.join(__dirname, filePath);
  fileContents = getContents(filePath);
  outputHTML = svgToSymbol(filePath, fileContents);
  $ = cheerio.load(outputHTML, { xmlMode: true });
  $symbol = $('symbol'); 
}

var filePath, fileContents, outputHTML, $, $symbol;

describe('#svgToSymbol utility', function() {

  describe('making a symbol from the contents of an svg file', function() {

    setup(FILE_PATHS.goodSVG);

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

    it('properly parses SVGs without a closing SVG tag', function() {
      setup(FILE_PATHS.malformedSVG.noClosingSVGTag);

      expect($symbol[0].tagName).to.equal('symbol');
      expect($symbol.attr('id')).to.equal('no-closing-svg-tag');
    });

    // TODO: What sort of malformed-cases does the current impelmentation 
    // already work smoothly with? Just how robust do we want to be in the first place? 
  });

});