'use strict';

var cheerio = require('cheerio');
var path = require('path');

var BASE_SYMBOL_ATTRS = ['id', 'viewBox', 'aria-labelledby', 'role'];


function svgToSymbol(fileName, fileContents, opts) {
  var opts = opts || {};
  var $fileContents = cheerio.load(fileContents, { xmlMode: true });
	var $svg = $fileContents("svg");

  var extraAttrs = Array.isArray(opts.extraAttrs) ? opts.extraAttrs : [];
  var attrsToApply = _getSymbolAttrs(extraAttrs);
  
  var symbolString = '<symbol id="' + path.basename(fileName).replace(/\.[^/.]+$/, '') + '"';

  var attrName, attrValue;
  for (var i = 0; i < attrsToApply.length; i++) {
    attrName = attrsToApply[i];    
    attrValue = $svg.attr(attrName);

    if (typeof attrValue !== 'undefined') {
      symbolString += ' ' + attrName + '="' + attrValue + '"';
    }    
  }
  symbolString += '></symbol>';

	var $outputContents = cheerio.load(symbolString, { xmlMode: true });
	var $symbol = $outputContents("symbol");
  
	$symbol.html($svg.html());

	return $outputContents.html();
}


function _getSymbolAttrs(extraSymbolAttrs) {  
  var res = [].concat(BASE_SYMBOL_ATTRS);
  
  // TODO: In future ECMAScript 2015+ syntax, this could just be a Set
  for (var i = 0; i < extraSymbolAttrs.length; i++) {
    if (res.indexOf(extraSymbolAttrs[i]) === -1) {
      res.push(extraSymbolAttrs[i]);
    }
  }

  return res;
}

module.exports = svgToSymbol;