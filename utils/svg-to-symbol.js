'use strict';

var cheerio = require('cheerio');
var path = require('path');

function svgToSymbol(fileName, fileContents) {
	var $fileContents = cheerio.load(fileContents, { xmlMode: true });
	var $svg = $fileContents("svg");
	var viewBox = $svg.attr("viewBox");
	var $outputContents = cheerio.load("<symbol id='" + path.basename(fileName).replace(/\.[^/.]+$/, "") + "' viewBox='" + viewBox + "'></symbol>", { xmlMode: true });
	var $symbol = $outputContents("symbol");
  
	$symbol.html($svg.html());

	return $outputContents.html();
}


module.exports = svgToSymbol;