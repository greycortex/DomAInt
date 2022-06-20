const bigramDict = require("../models/bigrams_model_GRU64/bigram_vocabulary_all.json");
import { alphabet } from './constants'

/**
 * This is how to create bigram letters so it is possible to do:
 * fvect[bigrams.indexOf("ab")] += 1;
 *
 * @returns bigrams = [".-",".0",".a",...,"??"] // MAYBE: add "len","level", ...
 */

export function genBigrams() {
	var grams = [];

	for (var a of alphabet) {
		for (var b of alphabet) {
			if (
				a === "." &&
				b === "." // we don't need ".."
			)
				;
			else
				grams.push(a + b);
		}
	}

	return grams;
}

/**
* creates an array of url letter pairs
*
* @param {String} Domainname a domain to be formated
* @returns {Array} 2 dimensional letters of arrays, each containing 2 letters from URL
* @example example.com -> [[ex], [am], [pl], [e.], [co], [m0]]
*/

export function findBigrams(domainName) {
	let slicedDomain = [];
	// query through domain name
	for (let i = 0; i < domainName.length - 1; i++) {
		// create an empty array each query for every pair of URL letters
		let letters = [];
		// declare string variable = create a pair of current letters
		let string;
		string = domainName[i];
		// check if the other letter is still in range
		if (domainName[i + 1]) {
			string += domainName[i + 1];
			// if not, push Number 0
		} else {
			string += "0";
		}
		// push created string pair to array
		letters.push(string);
		// push current pair array to main array, so we get 2 dimensional array
		slicedDomain.push(letters);
	}
	// return 2 dimensional array of split URL pairs
	return slicedDomain;
}

/**
 * Returns array containing compared values from bigramDict
 *
 * @param {Array} slicedDomain sliced domain from findBigrams function
 * @returns {Array} returns an array input for Keras model
 * @example [[ex], [am], [pl], [e.], [co], [m0]] -> [ 0, 535, 717, 406, 692, 213, 17, 0, 0, 0, … ]
 */

export function bigramsToInt(slicedDomain) {
	// declare array for input values
	let modelInput = [];
	// load bigram Dictionary from browser storage

	// Parse JSON string into object
	// parse bigram dict to JSON object

	// foreach array from slicedDomain
	slicedDomain.forEach((e) => {
		e.forEach((item) => {
			// if bigram dictionary contains current combination
			if (item in bigramDict) {
				// push the value to model input variable
				modelInput.push(bigramDict[item]);
			} else {
				// if current combination is not in bigram Dictionary, push Number 1
				modelInput.push(1);
			}
		});
	});

	// make sure the input's length is 44

	// if input is shorter, push Number 0, foreach blank space
	if (modelInput.length < 44) {
		for (let i = modelInput.length; i < 44; i++) {
			modelInput.push(0);
		}
	}
	// slice the input, so the length is 44
	modelInput = modelInput.slice(0, 44);

	// return the input
	return modelInput;
}