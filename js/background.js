// getCurrentURL function gets and returns current tab url adress

// need to include threshold settings, set better default threshold

/*
 * GREYCORTEX Research domAIn
 * Processes domain name in node.js and browser.
 *
 * Note: Domain class servers as Domain (and DomainSuffix in mendel.common) Java classes.
 *
 * // TODO: https://en.wikipedia.org/wiki/IDN_homograph_attack
 * //  see: https://github.com/nchah/url-alert
 * // TODO: detection of cyrilic (fake-latin-like) characters  а, е, о, р, с, у, х as !
 *
 * Copyright (C) 2019-20 GreyCortex s.r.o.
 * @author p3
 */

// include neural network
/*
 const SYNAPTIC = require('./synaptic/synaptic');
 const {Neuron, Layer, Network, Trainer, Architect} = SYNAPTIC;
 
 // https://nodejs.org/api/url.html#url_url_domaintoascii_domain
 const URL = require('url');
 // https://developer.mozilla.org/en-US/docs/Web/API/URL
 
 // https://libraries.io/npm/punycode
 const PUNYCODE = require('./punycode/punycode');
 // for browser support, you may need https://github.com/bestiejs/punycode.js/tree/v1.4.1
 
 // File System https://nodejs.org/docs/latest-v8.x/api/fs.html
 const FS = require("fs");
 */

/** Maximum domain length */
const MAX_LENGTH = 255;
const MAX_LEVEL = MAX_LENGTH - 128;
const MAX_SUFFIX_LEVEL = 5;

/* Regular expressions in the base form */
const LATIN_REGEX = /[a-z]+/; // \\p{Lower}+
const LATIN_REGEX_GLOBAL = /[a-z]+/g;
const NUMBER_REGEX = /[0-9]+/; // \\p{Digit}+
const DOT_REGEX = /\./;
const DASH_REGEX = /[\-|_]+/;
const WWW_REGEX = /w+[0-9]*/;
const IP_REGEX = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
const IDN_REGEX = /xn--/;
const BS_REGEX = /[^\.\-_0-9a-z]/g;

// load and prepare the model of up to 44 overlapping bigrams trained from github 
const MODEL_PATH = "https://raw.githubusercontent.com/greycortex/DomAInt/rnn/models/domain_bigrams-lstm/model.json"
// const MODEL_PATH = "https://raw.githubusercontent.com/greycortex/DomAInt/master/models/doman_bigrams-lstm.js/model.json";
// "https://raw.githubusercontent.com/greycortex/DomAIn/master/models/model-M0/model.json";

// global variable for model loading
let model;

/**
 * function loadModel is used to load tfjs model
 */
async function loadModel() {
    console.log("loading model...");
    model = await tf.loadLayersModel(MODEL_PATH);
}

// run model at the start, so it can be used
loadModel();

// load model each 4 hours in case it has been updated to a newer version
setInterval(loadModel, 4000 * 60 * 60);

// static suffixes

// TODO: replace dictionary

/**
 * Load JSON dictionaries 
 * 
 * @param {type} dictionaryy
 * @returns {undefined}
 */
loadJSON("../data/dict.json", function (dictionaryy) {

    // Parse JSON string into object
    let dictionary = JSON.parse(dictionaryy);

    // TODO: replace dictionary

    loadJSON("../data/suffix.json", function (SUFFIXx) {
        // Parse JSON string into object
        let suffix = JSON.parse(SUFFIXx);

        // ../data/bigram_vocabulary2.json
        loadJSON("../models/bigrams_model_GRU64/bigram_vocabulary_all.json", function (bigramDict) {
            var suffixes = null;

            /** Stub type enum */
            const StubType = {DOT: 0, DASH: 1, NUMBER: 2, LATIN: 3, BS: 4};
            Object.freeze(StubType);

            /**
             * Stub class represents a subdomain or its part (word, number, -, ...)
             *
             * @property {string} subdomain
             * @property {integer} level
             * @property {StubType} sType
             * @property {string[]} words
             */
            class Stub {
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

            /**
             * This class represents Java (mendel.common) Domain.
             *
             * @property {string} name nice UTF-8
             * @property {boolean} idn
             * @property {string[]} subs in reverse order UTF-8
             * @property {string} suffix in reverse order ASCII
             * @property {Stub[]} part1 primary Stubs
             * @property {null|Stub[]} part2 alternate Stubs
             *
             */

            class Domain {
                // throws
                constructor(domain) {
                    if (!domain || domain.length == 0)
                        throw "The the domain is null";

                    // get the ascii/latin name w/o port
                    var ports = domain.trim().toLowerCase().split(":");
                    domain = ports[0];
                    var ascii = punycode.toASCII(domain);
                    if (BS_REGEX.test(ascii)) {
                        throw (
                                "DOMAIN.validate(): The domain doesn't comply to RFC1034 or so: " +
                                domain
                                );
                    }

                    /** The complete normalized name */
                    this.name = this.validate(domain);
                    this.name
                            .replace(/_/g, "-")
                            .replace(/[0-9]/g, "0")
                            .replace(/[~!@#$%^&*()+\-=?;:'",<>\{\}\[\]\\\/]/gi, "?");
                    /** Whether is IDN - */
                    this.idn = IDN_REGEX.test(ascii);

                    /** String subdomains in reverse order (level 1 = 0) - the length gives all the levels */
                    this.subs = replaceNice(this.name).split(".").reverse();
                    if (!this.subs || this.subs.length == 0) {
                        throw (
                                "DOMAIN.validate(): The domain doesn't comply to RFC1034 or so: " +
                                domain
                                );
                    }
                    for (var s of this.subs) {
                        if (s.length == 0)
                            throw (
                                    "DOMAIN.validate(): The domain doesn't comply to RFC1034 or so: " +
                                    domain
                                    );
                    }

                    /** Get the longest suffix possible */
                    this.suffix = this.getSuffix(this.subs);

                    /** Subdomain classes (level 1+) level: [Stubs], aka. Map<Integer, List<Stub>> */
                    this.part1 = {};
                    /** Subdomain alternative classes (level 1+) */
                    this.part2;

                    // proceed :) :) :)
                    for (var i = 1; i <= this.subs.length; i++) {
                        var sub = this.subs[i - 1].trim();
                        // not necessary to limit the length to 63 chars as: if (sub.length > 63) ...;

                        // split by non-Latin characters
                        var last_end = 0;
                        var mf;
                        while ((mf = LATIN_REGEX.exec(sub.substring(last_end)))) {
                            var start = last_end + mf.index;
                            var end = last_end + start + mf[0].length;

                            // process what is left in front of found
                            if (start - last_end > 0) {
                                // split Digit, _- and nonsense here
                                var stub = this.getStrings(
                                        sub,
                                        i,
                                        sub.substring(last_end, start)
                                        ); // List<Domain.Stub>
                                this.putStub(1, i, stub);
                                if (this.part2)
                                    this.putStub(2, i, stub);
                            }

                            var words = this.getWords(i, mf[0]); // List<Stub>
                            if (words.length == 1) {
                                this.putStub(1, i, words[0]);
                                // if there is an alternative
                                if (this.part2)
                                    this.putStub(2, i, words[0]);
                            }
                            if (words.length > 1) {
                                // add alternative for higher level domains only
                                if (i > 1) {
                                    // get the second best option
                                    var best = 1;
                                    var rating = Number.MAX_VALUE;
                                    for (var c = words.length - 1; c > 0; c--) {
                                        var r = words[c].rating();
                                        if (
                                                r < rating &&
                                                (this.part2 || r < words[c].subdomain.length)
                                                ) {
                                            // rating = length :(
                                            rating = r;
                                            best = c;
                                        }
                                    }

                                    if (rating < Number.MAX_VALUE) {
                                        // and putStub there the best
                                        this.putStub(2, i, words[best]);
                                    }
                                }

                                // this should be done at the end, so the previous doesn't copy it
                                this.putStub(1, i, words[0]);
                            }

                            last_end = end;
                        }

                        // process what is left at the end
                        if (sub.length - last_end > 0) {
                            // split Digit, _- and nonsense here
                            var stub = this.getStrings(
                                    sub,
                                    i,
                                    sub.substring(last_end, sub.length)
                                    ); // List<Domain.Stub>
                            this.putStub(1, i, stub);
                            if (this.part2)
                                this.putStub(2, i, stub);
                        }
                    }
                }

                /**
                 * This is to replace part1|2.putStub(1|2, level, subDomain[s]).
                 *
                 * @param {int} number of partition
                 * @param {int} level
                 * @param {Stub|Stub[]} sd
                 * @return {Stub[]}
                 */
                putStub(number, level, sd) {
                    var part = this.part1; // Map<Integer, List<Stub>>
                    if (number > 1) {
                        if (!this.part2) {
                            this.part2 = {};
                            // an attempt to clone the part1 into part2
                            for (var l in this.part1) {
                                this.part2[l] = [].concat(this.part1[l]);
                            }
                        } // clone it
                        part = this.part2;
                    }

                    var p = []; // List<Stub>
                    if (part[level]) {
                        if (Array.isArray(sd)) {
                            part[level] = part[level].concat(sd);
                            p = sd;
                        } // concat arrays
                        else {
                            part[level].push(sd);
                            p = [sd];
                        } // just assume it is Stub
                    } else {
                        if (Array.isArray(sd))
                            p = sd;
                        // it is already an letters
                        else
                            p.push(sd); // new letters
                        part[level] = p;
                    }

                    return p;
                }

                /**
                 * Dummy getWords for other characters that aren't processed.
                 *
                 * @param {string} subdomain
                 * @param {int} level
                 * @param {string|NOT string[]!} str
                 * @return List<Stub>
                 */
                getStrings(subdomain, level, str) {
                    if (!str == null || str.length == 0)
                        return null;
                    var subParts = []; // List<Stub>
                    // TODO: split and parse :(

                    // split by non-Latin characters
                    var s = str;
                    while (s.length > 0) {
                        // Matcher n = NUMBER.matcher(s);
                        // Matcher d = DASH.matcher(s);

                        // var nf = s.length(); // ints
                        // var df = s.length();

                        // if (n.find()) nf = n.start();
                        var nf = NUMBER_REGEX.exec(s);
                        // if (d.find()) df = d.start();
                        var df = DASH_REGEX.exec(s);

                        if (nf && nf.index === 0) {
                            // got NUMBER
                            var ss = s.substring(0, nf[0].length);
                            // if (DISABLE_BS) ss = ss.replaceAll(".", "9");
                            subParts.push(new Stub(subdomain, level, StubType.NUMBER, ss));
                            s = s.substring(nf[0].length);
                        } else if (df && df.index === 0) {
                            // got DASH
                            var ss = s.substring(0, df[0].length);
                            // if (DISABLE_BS) ss = ss.replaceAll(".", "-");
                            subParts.push(new Stub(subdomain, level, StubType.DASH, ss));
                            s = s.substring(df[0].length);
                        } else {
                            // ? - other chars
                            var of = s.length; // int
                            if (nf && df)
                                of = Math.min(nf.index, df.index);
                            else if (df)
                                of = df.index;
                            else if (nf)
                                of = nf.index;
                            var ss = s.substring(0, of);
                            // if (DISABLE_BS) ss = ss.replaceAll(".", "?");
                            subParts.push(new Stub(subdomain, level, StubType.BS, ss));
                            s = s.substring(of);
                        }
                    }

                    return subParts;
                }

                /**
                 * This gets all strs from only REMAINING letter-based string.
                 * You should use something like this:
                 * String[] ss = subdomain.split("\\P{Alpha}+");
                 * for (String s : ss) {
                 *    if (s.length() > 0) keys.add(s);
                 * }
                 *
                 * @param str
                 * @return {Stub[]}
                 */
                getWords(level, str) {
                    if (str == null || str.lenght == 0)
                        return null;
                    var subParts = []; // ordered List<Stub>
                    var words = []; // ordered List<String>

                    // simple recursive bullshit - minimum is a bigram :(given by the directory):
                    for (var e = str.length; e >= 1; e--) {
                        var substr = str.substring(0, e); // was b, e, String

                        // if "found" or desperate (no strs, no Stub), try second
                        if ((words.length == 0 && e == 1) || dictionary[substr]) {
                            // CHECK: subParts.isEmpty() && strs.isEmpty()
                            words.push(substr);
                            if (e < str.length) {
                                var rest = this.getRest(str.substring(e));
                                words = words.concat(rest);
                            }
                            if (e == str.length || this.covers(str, words)) {
                                // 3 is there so it doesn't do [co,m] when there's [com]: (covers(str1, strs) && (str1.length() > 3 || subParts.isEmpty()))
                                var subD = new Stub(str, level, StubType.LATIN, words);
                                subParts.push(subD);
                                words = [];
                            }
                        }
                        // if
                        // else if (subParts.size() >= 2) break; // fair enough
                    }

                    // add there what left from above
                    if (words.length > 0) {
                        if (subParts.length == 0) {
                            var subD = new Stub(str, level, StubType.LATIN, words);
                            subParts.push(subD);
                        }
                        // in case we have a very nice strs that cover the whole str1 in case the str1 is longer than 3 (avoid [co,m])
                        else if (subParts.length >= 1 && this.covers(str, words)) {
                            // or something else ... good luck! - the last part || !covers(...) may not be necessary: if ((covers(str1, strs) && (str1.length() > 3 || subParts.isEmpty())) || !covers(str1, ((Stub)subParts.get(0)).strs)) {
                            var subD = new Stub(str, level, StubType.LATIN, words);
                            subParts.push(subD);
                        }
                    }

                    // deduplicate what we got ?
                    if (subParts.length > 1) {
                        // else fair enough
                        // TODO: ??? optimize + profile ?
                    }

                    return subParts;
                }

                /**
                 * This recursively gets all strs from only REMAINING letter-based string.
                 *
                 * @param str
                 * @return {string[]}
                 */
                getRest(str) {
                    var words = []; // new ArrayList<>()
                    if (!str || str.length == 0)
                        return words;

                    // simple recursive bullshit - minimum is a bigram :(given by the directory):
                    for (var e = str.length; e >= 1; e--) {
                        var substr = str.substring(0, e); // was b, e, string

                        // if "found" or desperate (no strs), try second
                        if ((words.length == 0 && e == 1) || dictionary[substr]) {
                            words.push(substr);
                            if (e < str.length) {
                                var rest = this.getRest(str.substring(e));
                                words = words.concat(rest);
                            }
                            if (e == str.length || this.covers(str, words))
                                break;
                        }
                    }

                    return words;
                }

                /**
                 * This returns whether the strs cover the whole string.
                 *
                 * @param str
                 * @param {string[]} words
                 * @return full coverage
                 */
                covers(str, words) {
                    var c = str.length;
                    for (var w of words)
                        c -= w.length;
                    return c <= 0;
                }

                /**
                 * Validates the domain name against to
                 * [RFC 1034] <https://tools.ietf.org/html/rfc1034> (actual version) and
                 * [RFC 3492] <https://tools.ietf.org/html/rfc3492> and
                 * [RFC 5891] <https://tools.ietf.org/html/rfc5891>
                 *
                 * @param {string} domain
                 * @returns {string} validate.name in UTF-8
                 * @throws IllegalArgumentException
                 */
                validate(domain) {
                    if (!domain) {
                        throw "DOMAIN.validate(): The domain is null.";
                    }

                    // get the real name in UTF-8
                    var name = punycode.toUnicode(domain.trim().toLowerCase());
                    if (domain.trim().length > MAX_LENGTH || name.length > MAX_LENGTH) {
                        throw (
                                "DOMAIN.validate(): The domain is longer than 255 characters: " +
                                domain
                                );
                    }
                    // check if there is something weird like xn--
                    if (IDN_REGEX.test(domain)) {
                        throw (
                                "DOMAIN.validate(): The domain doesn't comply to RFC3490: " +
                                domain
                                );
                    }
                    // check if there is an IP address
                    if (IP_REGEX.test(domain)) {
                        throw "DOMAIN.validate(): The domain is an IP address: " + domain;
                    }

                    return name;
                }

                /**
                 * Returns the suffix as a string in reverse order ASCII
                 *
                 * @param {type} ascii
                 * @returns {string} Domain.suffix
                 */
                getSuffix(ascii) {
                    if (!suffixes) {
                        try {
                            suffixes = JSON.parse(SUFFIXx);
                        } catch (e) {
                            // var SH = require("shelljs");
                            // console.log("pwd: "+ SH.pwd());
                            throw "DOMAIN.getSuffix(): Can't read suffixes: " + e;
                        }
                    }
                    if (!suffixes) {
                        throw "DOMAIN.getSuffix(): Can't read suffixes!";
                    }
                    // else console.log("suffixes.length: "+ Object.keys(suffixes).length);

                    // that's it
                    var suffix = null;
                    // to be parsedBigramDict
                    var arr = null;

                    if (typeof ascii === "string") {
                        arr = ascii.split(".").reverse().slice(0, MAX_SUFFIX_LEVEL);
                    } else if (Array.isArray(ascii)) {
                        arr = ascii.slice(0, MAX_SUFFIX_LEVEL);
                    } else {
                        // exception
                        throw "DOMAIN.getSuffix(): Unknown type of ASCII domain.";
                    }

                    // try the longest one
                    for (var i = arr.length; i > 0; i--) {
                        suffix = arr.slice(0, i).join(".");
                        if (suffixes[suffix])
                            break;
                    }

                    return suffix;
                }

                ////////////////////////////////////////////////////////////////////////////

                /**
                 * This may do 1-2 lines with primary and secondary combination.
                 *
                 * @return {string} CSV
                 */
                toCSV() {
                    var str1 = this.name + "," + this.suffix;
                    var str2 = null;

                    for (var i = this.subs.length; i > 0; i--) {
                        // alternative 1
                        var sd = this.part1[i]; // List<Stub>
                        if (!sd || sd.length == 0)
                            str1 += ",[]";
                        else {
                            for (var k = 0; k < sd.length; k++) {
                                str1 += "," + sd[k].toCSV();
                            }
                        }
                        if (i > 1)
                            str1 += ",.";

                        // alternative (2)
                        if (this.part2) {
                            // not empty
                            if (!str2)
                                str2 = this.name + "," + this.suffix;
                            var sd = this.part2[i];
                            if (!sd || sd.length == 0)
                                str2 += ",[]";
                            else {
                                for (var k = 0; k < sd.length; k++) {
                                    str2 += "," + sd[k].toCSV();
                                }
                            }
                            if (i > 1)
                                str2 += ",.";
                        }
                    }

                    //if (idn) {
                    //    str1 += ",#IDN";
                    //    str2 += ",#IDN";
                    //}

                    if (str2)
                        return str1 + "\n" + str2;
                    else
                        return str1;
                }
            }

            /** A compact DomAIn alphabet (c) 2018 P3+M */
            const alphabet = [
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
                "?",
            ];

            /** Substitutions */
            const substitute = {
                //    ".",
                _: "-",
                1: "0",
                2: "0",
                3: "0",
                4: "0",
                5: "0",
                6: "0",
                7: "0",
                8: "0",
                9: "0",
                // "a",
                k: "c",
                b: "d",
                // "e",
                j: "g",
                y: "i",
                h: "l",
                n: "m",
                // "o",
                q: "p",
                x: "r",
                z: "s",
                f: "t",
                // "u",
                v: "w",
                // "?"
            };

            /**
             * A nice replace of dictionary to be Pareto-friendly.
             * see https://stackoverflow.com/a/44475397:
             */
            function replaceChars(domain) {
                return domain
                        .replace(/[_123456789kbjyhnqxzfv]/g, (c) => substitute[c])
                        .replace(/[^\.\-0-9a-z]/g, "?");
            }

            /**
             * A nice replace of numbers and BS - this is what you want :)
             */
            function replaceNice(domain) {
                return domain
                        .replace(/[_123456789]/g, (c) => substitute[c])
                        .replace(/[^\.\-0-9a-z]/g, "?");
            }

            /**
             * A nice replace of bullshits - doesn't apply substitutions!
             * see https://stackoverflow.com/a/44475397:
             */
            function replaceBS(domain) {
                return domain.replace(BS_REGEX, "?");
            }

            /**
             * This is how to create bigram letters so it is possible to do:
             * fvect[bigrams.indexOf("ab")] += 1;
             *
             * @return bigrams = [".-",".0",".a",...,"??"] // MAYBE: add "len","level", ...
             */

            function genBigrams() {
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
             * getCurrentURL gets URL from curretly opened tab and returns it as a string
             *
             *
             *
             * @returns {string} current URL
             */

            function getCurrentURL() {
                let currentTab;
                // returns promise, so we can await the value
                return new Promise((resolve) => {
                    try {
                        //query current browser tab
                        browser.tabs
                                .query({currentWindow: true, active: true})
                                //after we get info about current tab, resolve it's URL adress
                                .then((tabs) => {
                                    currentTab = tabs[0].url;

                                    if (currentTab.startsWith("http")) {
                                        resolve(currentTab);
                                    } else {
                                        resetIcon();
                                    }
                                });
                    } catch (err) {
                        console.log(err);
                    }
                });
            }

            /**
             * create array of URL letter pairs == example.com -> [[ex], [am], [pl], [e.], [co], [m0]]
             * Returns 2 dimensional letters of arrays, each containing 2 letters from URL
             *
             * @param {String} Domain.name example.com
             * @returns {Array} [[ex], [am], [pl], [e.], [co], [m0]]
             */

            function findBigrams(domainName) {
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
             * @param {Array} takes sliced domain from findBigrams function -> [[ex], [am], [pl], [e.], [co], [m0]]
             * @returns {array} returns an array input for Keras model -> [ 0, 535, 717, 406, 692, 213, 17, 0, 0, 0, … ]
             */
            function bigramsToInt(slicedDomain) {
                // declare array for input values
                let modelInput = [];
                // load bigram Dictionary from browser storage

                // Parse JSON string into object
                // parse bigram dict to JSON object
                const parsedBigramDict = JSON.parse(bigramDict);

                // foreach array from slicedDomain
                slicedDomain.forEach((e) => {
                    e.forEach((item) => {
                        // if bigram dictionary contains current combination
                        if (item in parsedBigramDict) {
                            // push the value to model input variable
                            modelInput.push(parsedBigramDict[item]);
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

            /**
             * Returns Keras model prediction
             *
             * @param {array} takes input array containing URL pair values compared to bigram dictionary -> [ 0, 535, 717, 406, 692, 213, 17, 0, 0, 0, … ]
             * @returns {Number} Model prediction -> 0.9485247731208801
             */

            async function runModel(inputArray) {
                // create tensor input from inputArray param
                const input = tf.tensor([inputArray]);
                // create result from model prediction
                const prediction = model.predict(input);
                // convert result for future usage
                const finalResult = prediction.dataSync()[0];
                //return changeIcon(finalResult);

                // return result
                return finalResult;
            }

            /**
             * changes icons according to Keras model result
             *
             * @param {Number} takes Keras model result -> 0.9485247731208801
             */

            function changeIcon(modelResult) {
                let greenThreshold = 0.2;
                let orangeThreshold = 0.6;
                let redThreshold = 0.9;

                let threshold = browser.storage.local.get("threshold");
                threshold.then((res) => {
                    // if theres no site being blacklisted
                    if (res.threshold != null && res.threshold.length > 0) {
                        let threshold = JSON.parse(res.threshold);
                        greenThreshold = (threshold.green == 0) ? 0 : threshold.green / 100;
                        orangeThreshold = threshold.orange / 100;
                        redThreshold = threshold.red / 100;
                    }

                    // TODO: comment this!
                    console.log(greenThreshold, orangeThreshold, redThreshold);

                    // if result is less then 0.2 or settings
                    if (modelResult >= 0 && modelResult <= greenThreshold) {
                        browser.browserAction.setTitle({title: "This page seems to be safe!"});
                        // set extension icon to green
                        browser.browserAction.setIcon({
                            path: "img/green.png",
                        });

                    // if result is between green and orande, it is the grey area
                    } else if (modelResult > greenThreshold && modelResult < orangeThreshold) {
                        browser.browserAction.setTitle({
                            title: "This is the grey area, we can't say much more.",
                        });
                        // set extension icon to orange
                        browser.browserAction.setIcon({
                            path: "img/grey.png",
                        });

                    // if result is below red, it is orange
                    } else if (modelResult >= orangeThreshold && modelResult < redThreshold) {
                        browser.browserAction.setTitle({
                            title: "This page might not be all safe.",
                        });
                        // set extension icon to orange
                        browser.browserAction.setIcon({
                            path: "img/orange.png",
                        });

                    // if result is bigger than red it is dangerous
                    } else if (modelResult >= redThreshold && modelResult <= 1.0) {
                        browser.browserAction.setBadgeBackgroundColor({color: "red"});
                        browser.browserAction.setTitle({
                            title: "Warning: this page might be dangerous!",
                        });
                        // set extension icon to red
                        browser.browserAction.setIcon({
                            path: "img/red.png",
                        });
                    // whatever may (have) happened
                    } else {
                        browser.browserAction.setTitle({title: "DomAIn by GreyCortex"});
                        // if model didnt predict or an error has occured, set grey
                        browser.browserAction.setIcon({
                            path: "img/base.png",
                        });
                    }
                });
            }

            /*
             function resetIcon resets icon, when on a page, that is not supposed to be tested 
             */
            function resetIcon() {
                // set popup icon title to the base one
                browser.browserAction.setTitle({title: "DomAIn by GreyCortex"});
                // change icon to the base one
                browser.browserAction.setIcon({
                    path: "img/base.png",
                });
            }



            let cachedURL;
            let Result;
            let lastClosedSite;
            let isAfterClose;

            /**
             * this function is called whenever a new tab is active or user navigates to a new url.
             * this function is not called if a user navigates to a closed site using "continue once" option
             * function checks whether the url is either in blacklist or whitelist -> if so, icon is change to the specified one.
             * if a non http/https url is active (such as blank page, new tab,...) function returns icon reset.
             * if a http/https url request is made, function checks whether the url is cached, if so = icon is changed to the cached result
             * if not, the url is scanned using the DomAInt model
             * 
             *
             * @returns {function} returns certain function call depending on the case
             */

            async function runCode() {
                console.log("code runs");
                if (!isAfterClose) {
                    let next = true;
                    // variable storing last visited URL (used not to run code, when not necessary)
                    // result variable used for icon change when accessing a cached URL (used not to run code, when not necessary)

                    let tab = await getCurrentURL();

                    let adress = tab
                            .replace("http://", "")
                            .replace("https://", "")
                            .replace("www.", "")
                            .split(/[/?#]/)[0];

                    let domainControl = tab
                            .replace("http://", "")
                            .replace("https://", "")
                            .replace("www.", "");


                    browser.storage.local.get("blackList").then((res) => {
                        // if blacklist exists
                        if (res.blackList) {
                            // parse blacklist to object
                            const blackList = JSON.parse(res.blackList);

                            // compare each blacklisted sites to the one being accessed
                            blackList.forEach((site) => {
                                // compare blacklisted site to the one being accessed
                                if (
                                        adress.toLowerCase() == site.regex ||
                                        domainControl.toLowerCase() == site.regex
                                        // if accesed site is blacklisted, use close function to close it
                                        ) {
                                    // get autoclose function settings from browser storage
                                    browser.storage.local.get("autoClose").then((res) => {
                                        // if autoClose is enabled by the user continue, else stop
                                        if (res.autoClose == true) {
                                            // get array of blacklisted sites
                                            let currentDomain = browser.tabs.query({
                                                currentWindow: true,
                                                active: true,
                                            });
                                            currentDomain.then((tab) => {
                                                const closeSite = tab[0].id;
                                                console.log(`close site ${closeSite}`);
                                                const closedSiteUrl = tab[0].url;
                                                closeTab(closeSite);
                                                lastClosedSite = closedSiteUrl;
                                                showAfterClosePopup();
                                            });
                                            // return if autoClose is not enabled
                                        }
                                        browser.browserAction.setTitle({
                                            title: "This site is blacklisted",
                                        });
                                        // set extension icon to green
                                        browser.browserAction.setIcon({
                                            path: "img/gb.png",
                                        });
                                        next = false;
                                    });

                                }
                            });
                            // return if there's no blacklist
                        }
                    });



                    browser.storage.local.get("whiteList").then((res) => {
                        // if whitelist exists
                        if (res.whiteList) {
                            // parse blacklist to object
                            const whiteList = JSON.parse(res.whiteList);

                            // compare each blacklisted sites to the one being accessed
                            whiteList.forEach((site) => {
                                // compare blacklisted site to the one being accessed
                                if (
                                        adress.toLowerCase() == site.regex ||
                                        domainControl.toLowerCase() == site.regex
                                        // if accesed site is blacklisted, use close function to close it
                                        ) {
                                    // get autoclose function settings from browser storage
                                    browser.browserAction.setTitle({
                                        title: "This site is whitelisted",
                                    });
                                    // set extension icon to green
                                    browser.browserAction.setIcon({
                                        path: "img/base.png",
                                    });
                                    next = false;
                                    return;
                                }
                            });
                        }


                        if (next) {
                            // get URL of current tab
                            // run code only if a new site is visited else change icon according to cached URL
                            if (tab && tab !== cachedURL) {
                                console.log("tab is " + tab);
                                console.log("cached url is " + cachedURL);
                                cachedURL = tab;
                                // prevent code from running on special sites (extension::, ...)
                                if (tab.includes("http://") || tab.includes("https://")) {
                                    // parse the URL to string we need == https://www.example.com -> example.com

                                    createDomainrunModel(adress);

                                } else {
                                    // if on a special site change icon to the base one
                                    resetIcon();
                                }
                            } else {
                                console.log("this site is cached");
                                console.log("result is " + Result);
                                // if we visit cached site, change icon according to previously run and cached result (prevent from running code when not necessary)
                                if (Result) {
                                    // log cached result
                                    console.log(Result);
                                    // change icon according to the cached result
                                    changeIcon(Result);
                                }
                            }
                        }
                    });
                }
                isAfterClose = false;
                console.log("changed to false");
            }

            /**
             * Returns icon change depending on the url scan result
             *
             * @param {string} takes url that should be scanned with the AI model
             * @param {string} since the functionality differs if the function is called using the runCode function
             * or with the context menu, source parameter is present and is set to background
             * @returns {function} calls changeIcon function
             */

            function createDomainrunModel(adress, source = "background") {

                console.log("adress in func is " + adress + " from source " + source);
                // create new object of class Domain from changed URL
                let domain = new Domain(adress);

                // regex domain, having replaced certain values replaced for model usage
                // slice domain, so we can create model input
                let sliced = findBigrams(domain.name);
                // from sliced URL, generate model input
                modelInput = bigramsToInt(sliced);
                // run model and get model prediction
                let output = runModel(modelInput);
                output.then((res) => {
                    // log prediction
                    console.log(res);
                    if (source == "background") {
                        // set cached result
                        Result = res;
                        // change icon according to the Result (danger icon, ...)
                        changeIcon(Result);
                    }
                });
            }

            /**
             * Creates a context menu, which is navigated to using the right mouse click (only works on links)
             * 
             */

            browser.contextMenus.create({
                id: "analyze-link",
                title: "Analyze link using DomAInt",
                contexts: ["link"],
            });


            /**
             * Listener that listens, if the context menu option is used, if so, parses the url for the model using regex
             * and returns the AI function call with the url
             *
             * @param {object} info checks if exactly analyze link option is clicked
             * or with the context menu, source parameter is present and is set to background
             * @returns {function} createDomainrunModel
             */

            browser.contextMenus.onClicked.addListener((info) => {
                if (info.menuItemId === "analyze-link") {
                    // Always HTML-escape external input to avoid XSS.
                    const safeUrl = escapeHTML(info.linkUrl);
                    const finalAdress = safeUrl.replace("http://", "")
                            .replace("https://", "")
                            .replace("www.", "")
                            .split(/[/?#]/)[0];


                    createDomainrunModel(finalAdress, "contextMenu");
                }
            });

            /**
             * On message listener that listens for "continue once" message from the afterclose popup
             * sets the afterclose value to true, to ensure, that the runCode function wont close the tab this time
             * creates a new tab with the url of the last closed site
             * since the tab cration will fire mutliple listeners, setTimeout ensures, that the site will be opened and not closed
             *
             * @param {object} request = used to check for the continue once message
             * @param {function} sendResponse used for callback
             * @returns {callback} callbacks response (used for debbuging)
             */

            browser.runtime.onMessage.addListener(
                    function (request, sender, sendResponse) {
                        if (request.msg === "continue_once") {
                            isAfterClose = true;
                            console.log("changed to true");
                            browser.tabs.create({url: lastClosedSite});
                            setTimeout(() => {
                                isAfterClose = false;
                            }, 5000)
                            sendResponse(`tab with url ${lastClosedSite} created`);
                        }
                    }
            );

            /**
             * Listener that listens for send url message, which sends the url of last closed site
             * @param {function} sendResponse used for callback
             * @returns {callback} callbacks response
             */

            browser.runtime.onMessage.addListener(
                    function (request, sender, sendResponse) {
                        if (request.msg === "send_url") {
                            sendResponse(lastClosedSite);
                        }

                    }

            );

            /**
             * this function is used to get url from context menu click as we need it
             *
             * @param {string} str to be parsed using regex
             * @returns {string} returns string with replaced special characters
             */

            // https://gist.github.com/Rob--W/ec23b9d6db9e56b7e4563f1544e0d546
            function escapeHTML(str) {
                // Note: string cast using String; may throw if `str` is non-serializable, e.g. a Symbol.
                // Most often this is not the case though.
                return String(str)
                        .replace(/&/g, "&amp;")
                        .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
                        .replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }

            /**
             * showAfterClosePopup is used to send message to content script to inject iframe of our popup to the new tab
             * and is fired whenever a blacklisted site is closed
             *  
             * gets id of the new tab (neede to send a message), then sends the message
             */

            function showAfterClosePopup() {
                let currentDomain = browser.tabs.query({
                    currentWindow: true,
                    active: true,
                });
                currentDomain.then((tab) => {
                    const currentTabId = tab[0].id;
                    console.log(`curr tab ${currentTabId}`);
                    browser.tabs.sendMessage(currentTabId, {data: "show_popup"}).then((response => {
                        console.log(response);
                    }));
                });
            }

            /**
             * getCurrentTab (will replace repeating code, callback will be changed to promise)
             * used to get id of the active (current) tab
             *
             * @param {callback} defined to return callback for now
             * @returns {callback} callbacks the active tab object
             */

            function getCurrentTab(callback) {
                let currTab;
                let currentDomain = browser.tabs.query({
                    currentWindow: true,
                    active: true,
                });
                currentDomain.then((tab) => {
                    currTab = tab[0];
                    callback(currTab);
                });
            }

            /**
             * basically just closes the tab with specified id
             *
             * @param {string} id of the tab we wish to close
             * @returns {function} calls the browser api to close the tab
             */

            function closeTab(tabId) {
                // destroy specified browser tab
                browser.tabs.remove(tabId);
            }


            // code is executed whenever new browser tab is active/clicked
            /* current error - both of these listeners might be active at the same time 
             = code will try to autoclose twice, iframe will be added twice, also an error might happen
             */

            /**
             * listener that listens whenever a request is send
             *
             * @param {object} changeInfo - used to check if the site state is loading (prevents it for firing for multiple times,
             *  faster than waiting for a page to fully load to scan/close it)
             * @returns {function} runCode call
             */

            browser.tabs.onUpdated.addListener(function (tabid, changeinfo, tab) {
                // might replace the function that gets the url
                let url = tab.url;
                if (url !== undefined && changeinfo.status == "loading" && !isAfterClose) {

                    runCode();
                }
            });

            /**
             * Listener that is fired, whenever the active tab is changed (we click on a new tab)
             * @returns {function} runCode call
             */

            browser.tabs.onActivated.addListener(function () {
                if (!isAfterClose) {
                    console.log("fired");
                    runCode();
                }

            });
        });
    });
});

/*
 const inp =
 ".-_0123456789abcdefghijklmnopqrstuvwxyz@$#áéíýóúůěžščřďťň";
 const out =
 ".--0000000000adcdetgligclmmopprstuwwris??????????????????";
 console.log("replaceChars: \n" + inp);
 var outp = replaceChars(inp);
 console.log(out);
 console.log(outp);
 if (out != outp) {
 console.log("DOMAIN.unitTest(): replaceChars doesn't match.");
 throw "DOMAIN.unitTest(): replaceChars doesn't match.";
 }
 */

// console.log(JSON.stringify(genBigrams()));

/**
 * Test this DOMAIN by running:
 * $> node main.js test
 * $> node js/domain.js test
 */

/*
 function unitTest() {
 // test (runModel this file as c)
 console.log();
 console.log("DOMAIN test ...");
 
 // test replaceChars
 const inp = ".-_0123456789abcdefghijklmnopqrstuvwxyz@$#áéíýóúůěžščřďťň";
 const out = ".--0000000000adcdetgligclmmopprstuwwris??????????????????";
 console.log("replaceChars: \n"+ inp);
 var outp = replaceChars(inp);
 console.log(out);
 console.log(outp);
 if (out != outp) {
 console.log("DOMAIN.unitTest(): replaceChars doesn't match.");
 throw "DOMAIN.unitTest(): replaceChars doesn't match.";
 }
 console.log(replaceBS(inp));
 
 const nice = ".--0000000000abcdefghijklmnopqrstuvwxyz??????????????????";
 console.log("replaceNice: \n"+ nice);
 var outp = replaceNice(inp);
 console.log(outp);
 if (nice != outp) {
 console.log("DOMAIN.unitTest(): replaceNice doesn't match.");
 throw "DOMAIN.unitTest(): replaceNice doesn't match.";
 }
 
 //// test sandbox
 var domain = new Domain("mp3shits.com");
 console.log(domain.toCSV());
 console.log(JSON.stringify(domain));
 // throw "";
 
 // load test domains
 const testDomains = JSON.parse(FS.readFileSync("data/test-domains.json", "utf8"));
 console.log("\nTesting domains: ");
 // go around test domains
 for (var td of testDomains) {
 if (td[0] == "#") {
 console.log("\n"+ td);
 continue;
 }
 // else console.log(td +":")
 
 try {
 var domain = new Domain(td);
 console.log(domain.toCSV());
 // console.log(JSON.stringify(domain));
 
 } catch (e) {
 // console.error("Exception: The domain was not processed: "+ td);
 console.log(e +" - "+ e.stack);
 }
 } 
 
 console.log("... DOMAIN test passed!");
 }
 
 // pseudo-main for unit testing
 if (process && process.argv.includes("test")) unitTest();
 
 
 /** 
 * The public interface of DOMAIN counterpart. 
 */

/*
 module.exports = {
 version: "2019.3.0",
 SUFFIX,
 DICT,
 Stub,
 Domain,
 alphabet,
 genBigrams,
 replaceChars,
 replaceBS, // @deprecated
 unitTest
 };
 */

// each completed web navigation calls functions, so model can predict

//browser.tabs.onActivated.addListener(function() {

//});
