import chai from 'chai';
import { findBigrams, bigramsToInt } from '../src/bigramFunctions';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const assert = chai.assert;

describe('findBigrams tests', function () {

    /** 
    it('example.com parsing', function () {
        const url = "example.com";
        const expected = [["ex"], ["am"], ["pl"], ["e."], ["co"], ["m0"]];

        return assert.equal(findBigrams(url), expected);
	});
    */
   
});

describe('bigramsToInt tests', function () {

    it('example.com test', function () {
        const url = "example.com";
        const bigram = findBigrams(url);
        const expected = [435,57,864,597,444,592,837,750,850,469,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        const got = bigramsToInt(bigram);

        return chai.expect(got).to.deep.equal(expected);
	});

    it('expect length to be 44', function () {
        const url = "example.com";
        const bigram = findBigrams(url);
        const got = bigramsToInt(bigram);

        return assert.equal(got.length, 44);
	});
   
});