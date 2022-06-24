/**
 * Stub class represents a subdomain or its part (word, number, -, ...)
 *
 * @property {string} subdomain
 * @property {integer} level
 * @property {StubType} sType
 * @property {string[]} words
 */
export class Stub {
  /**
	 * Stub constructor.
	 *
	 * @param {string} sub
	 * @param {integer} lvl
	 * @param {StubType} sType
	 * @param {string[]} words
	 * @returns {nm$_domain.Stub}
	 * @throws {exceptionType} IllegalArgumentException
	 */
  constructor(sub, lvl, sType, words) {
	    if (!sub || !lvl || !sType || !words) {
      throw "DOMAIN.Stub(): Null in constructor.";
	    }
    
	    /** Ideally, this is the complete subdomain */
	    this.subdomain = sub;
	    /** Subdomain level */
	    this.level = lvl;
	    /** StubType - what it is */
	    this.stubType = sType;
	    /** The stub - part of the subdomain */
	    this.strs = [];
    
	    if (typeof words === "string") {
      this.strs.push(words);
	    } else if (Array.isArray(words)) {
      this.strs = words;
	    } else {
      // exception
      throw "DOMAIN.Stub(): Unknown type of words in constructor.";
	    }
  }
    
  /**
	 * Counts simple rating/digits etc in the strs list.
	 * @returns {Number} r
	 */
  rating() {
	    var r = 0;
	    for (var w of this.strs) {
      if (w.length > 0)
		    r += 1.0 / w.length;
      else
		    r += 2; // (wtf :)
	    }
	    return r;
  }
    
  /**
	 * Strings toString/CSV
	 * @returns {string} CSV
	 */
  toCSV() {
	    return this.strs.toString();
	    // if (ret.length > 1) ret = ret.substring(1, ret.length - 1);
	    // return ret;
  }
}