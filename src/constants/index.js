/** Maximum domain length */
export const MAX_LENGTH = 255;
export const MAX_LEVEL = MAX_LENGTH - 128;
export const MAX_SUFFIX_LEVEL = 5;

/* Regular expressions in the base form */
export const LATIN_REGEX = /[a-z]+/; // \\p{Lower}+
export const LATIN_REGEX_GLOBAL = /[a-z]+/g;
export const NUMBER_REGEX = /[0-9]+/; // \\p{Digit}+
export const DOT_REGEX = /\./;
export const DASH_REGEX = /[\-|_]+/;
export const WWW_REGEX = /w+[0-9]*/;
export const IP_REGEX = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
export const IDN_REGEX = /xn--/;
export const BS_REGEX = /[^\.\-_0-9a-z]/g;

/** A compact DomAIn alphabet (c) 2018 P3+M */
export const alphabet = [
	".",
	"-",
	"0",
	"a",
	"c",
	"d",
	"e",
	"g",
	"i",
	"l",
	"m",
	"o",
	"p",
	"r",
	"s",
	"t",
	"u",
	"w",
	"?"
];

/** Substitutions */
export const substitute = {
	//    ".",
	"_": "-",
	"1": "0",
	"2": "0",
	"3": "0",
	"4": "0",
	"5": "0",
	"6": "0",
	"7": "0",
	"8": "0",
	"9": "0",
	//    "a",    
	"k": "c",
	"b": "d",
	//    "e",    
	"j": "g",
	"y": "i",
	"h": "l",
	"n": "m",
	//    "o",    
	"q": "p",
	"x": "r",
	"z": "s",
	"f": "t",
	//    "u",
	"v": "w"
	//   "?"    
};