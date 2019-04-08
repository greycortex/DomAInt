/*
 * GREYCORTEX Research DomAIn
 * Main file for node.js.
 * 
 * Copyright (C) 2019 GreyCortex s.r.o.
 * @author p3
 * 
 * // TODO: output may use $DATE$ and $TIMESTAMP$ - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 * 
 */

// https://github.com/adaltas/node-csv
// csv.js https://github.com/avoidwork/csv.js
const CSV = require("./js/csv.js/csv");

// File System https://nodejs.org/docs/latest-v8.x/api/fs.html
const FS = require("fs");

// modules
const DOMAIN = require("./js/domain");
const {Domain, Stub} = DOMAIN;

const TRAIN = require("./js/train");


// default values
var input  = undefined;
var output = undefined;
var train  = "data/train.csv";
var test   = "data/test.csv";
var dict   = DOMAIN.DICT;   // DICT = "data/dict.json"
var suffix = DOMAIN.SUFFIX; // SUFFIX = "data/suffix.json";
var model  = "data/model.json";

// CSV/JSON thingy...
var keySuf = "suffix"; // if (args.key) keySuf = args.key;
var keyDom = "domain"; // if (args.key) keyDom = args.key;
var valRep = "rep";
var valPop = "pop";
var valNeg = "neg";
var valPos = "pos";

/**
 * Prints help...
 */
function printHelp() {
    console.log("Run:");
    console.log("  node main.js -h --help");
    console.log("  node --max-old-space-size=4096 main.js train-bigrams --train=data/samples-train.csv [--rate=0.01] [--its=10000] [--states=720] [] [] [--debug] [--characters [--fullalpha]]");
    console.log("  node main.js train test --train=data/samples-train.csv --test=data/samples-test.csv --model=data/model.json");
    console.log("  node main.js csv2json --input=data/suffixes-v0-20190309.csv --key=suffix --output=data/suffix.json --array=popularity,cntNeg,cntPos --pretty --debug");
    console.log("  node main.js csv2json --input=data/words-bs.domain.csv --output=data/dict.json --key=word --array=pop,neg,pos --pretty --debug");
    console.log("  node main.js json2json --input=data.json --output=data-pretty.json --pretty");
    console.log();
    console.log("--input represents input and less specific train/test file for the default data:");
    console.log("  "+ train +"  "+ test +"  "+ dict +"  "+ suffix +"  "+ model);
    console.log();
    console.log("Test:");
    console.log("  node main.js test");
    console.log("  chrome greycortex.com test");
    console.log();
}


/** Main args object can contain whatever from the above help example and main activities to be performed */
const args = {
    main: new Array() // what to do (they may be somehow combined :)
}

/** 
 * Gets arguments and formats them into a simple object.
 */
function getArgs() {
    process.argv
        .slice(2, process.argv.length)
        .forEach(arg => {
            // long arg
            if (arg.slice(0, 2) === "--") {
                const longArg = arg.split("=");
                var la1 = longArg[1];
                if (longArg.length == 1) la1 = true;
                args[longArg[0].slice(2, longArg[0].length)] = la1;
            }
            // flags
            else if (arg[0] === "-") {
                const flags = arg.slice(1, arg.length).split("")
                flags.forEach(flag => {
                    args[flag] = true;
                })
            }
            // run command (just one, take the last):
            else {
                args.main.push(arg);
            }
        });

    // unify (extend) short inputs...
    if (args.h) args["help"] = true;

    return args;
}




////////////////////////////////////////////////////////////////////////////////
// main() //////////////////////////////////////////////////////////////////////
// process.stdout._handle.setBlocking(true); //fix https://stackoverflow.com/questions/38085746/why-does-writing-to-stdout-in-a-hot-loop-cause-an-out-of-memory-shutdown#38086131
console.log("GREYCORTEX Research DomAIn");

// get args
getArgs();
if (args.debug) console.log(args);
console.log();

// print help
if (args.main.length == 0 || args.help) {
    printHelp();
}


// test ////////////////////////////////////////////////////////////////////////
if (args.main.includes("test") || args.main.includes("test-main")) {
    console.log("GREYCORTEX Research DomAIn test ... ");
    // do some more tests... all units are included automatically :)
    console.log("... all tests passed!");
    
    // this is a sandbox when running as test-main :) //////////////////////////




    ////////////////////////////////////////////////////////////////////////////
}


// csv2json ////////////////////////////////////////////////////////////////////
if (args.main.includes("csv2json")) {
    input = args.input;
    
    output = input.slice(0, input.length-4) +".json";
    if (args.output) output = args.output;
    console.log("csv2json "+ input + " >> "+ output +" ...");
    
    try {  
        const inputData = FS.readFileSync(input, "utf8");
        // console.log("typeof inputData: "+ typeof inputData);
        // console.log(inputData); // .toString()
        
        const inputCSV = CSV.decode(inputData, ",");
        // console.log("typeof inputCSV: "+ typeof inputCSV);
        // console.log(JSON.stringify(inputCSV));
        
        // output JSON
        var outputJSON = inputCSV;
        
        // transform the key if necessary
        if (args.key) {
            outputJSON = {};
            
            // for (var obj in inputCSV) ... inputCSV is an array(!)
            for(var i = 0; i < inputCSV.length; i++) {
                const obj = inputCSV[i];            
                if (args.debug && i < 10) console.log(JSON.stringify(obj));

                // this is what to store
                const key = obj[args.key];
                var val = null;
                
                // transform the value into an array if necessary
                if (args.array) {
                    val = [];
                    // var array = args.array; // create an array and hate JS, that cannot do args.array.split(",")
                    args.array.split(",") // array
                        .forEach(v => {
                            val.push(obj[v]);
                        })                    
                } 
                // just delete the key
                else {
                    delete obj[args.key];
                    val = obj;
                }

                // search the array +-efficiently
                outputJSON[key] = val;
                
                if (args.debug && i < 10) console.log("'"+ key +"': "+ JSON.stringify(outputJSON[key]));
            }
        }
        
        // save it
        if (args.pretty) FS.writeFileSync(output, JSON.stringify(outputJSON, null, 2), "utf8");
        else FS.writeFileSync(output, JSON.stringify(outputJSON), "utf8");
        
        console.log("... done.");
    } catch(e) {
        console.log(e.stack);
    }
}

// csv2json ////////////////////////////////////////////////////////////////////
if (args.main.includes("json2json")) {
    input = args.input;
    
    output = input.slice(0, input.length-4) +"-out.json";
    if (args.output) output = args.output;
    console.log("json2json "+ input + " >> "+ output +" ...");
    
    try {  
        const json = JSON.parse(FS.readFileSync(input, "utf8"));
        
        // save it, some is pretty, some is not...
        if (args.pretty) FS.writeFileSync(output, JSON.stringify(json, null, 2), "utf8");
        else FS.writeFileSync(output, JSON.stringify(json), "utf8");
        
        console.log("... done.");
    } catch(e) {
        console.log(e.stack);
    }
}


// train-bigrams ///////////////////////////////////////////////////////////////
if (args.main.includes("train-bigrams")) {
    var start = Date.now();
    
    // input
    if (args.train) input = args.train;
    else if (args.input) input = args.input;
    else input = train;
    
    // output
    output = input.slice(0, input.length-4) +".model.json";
    if (args.output) output = args.output;
    
    console.log("train-bigrams processing input "+ input + " ...");
    
    try {  
        // const inputData = FS.readFileSync(input, "utf8");
        // domain,rep,pop,level,branches,leaves,cnt,pos,neg,psl,features
        const inputCSV = CSV.decode(FS.readFileSync(input, "utf8"), ",");
        
        // get the domain name and bigrams metadata
        if (args.key) key = args.key;
        const bigrams = DOMAIN.genBigrams();

        // trainingSet = [ {id: "example.com", input: [0,0],output: [0]}, ... ]
        const trainSet = [];
        
        // for (var obj in inputCSV) ... inputCSV is an array(!)
        for(var i = 0; i < inputCSV.length; i++) {
            const obj = inputCSV[i];            
            if (args.debug && i < 1) console.log(JSON.stringify(obj));

            // get the domain name
            const dom = obj[keyDom];
            const rep = (obj[valRep]+1)/2;
            if (dom == null || rep == null) {
                console.log("null at sample "+ (trainSet.length + 1) +": "+ dom +" "+ rep);
                continue;
            }
            
            // transform
            var domain = DOMAIN.replaceChars(dom.split(".").reverse().join("."));
            // feature vector
            var fvect = null;

            if (args.characters) {
                var alphabet = DOMAIN.alphabet;
                
                if (args.fullalpha) {
                    domain = DOMAIN.replaceBS(dom.split(".").reverse().join("."));
                    alphabet = [".","-","_","0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","?"];
                }

                // create feature vector using (trasformed) letters
                fvect = Float64Array ? new Float64Array(alphabet.length) : Array(alphabet.length); // Array(alphabet.length);
                for (var n = 0; n < alphabet.length; n++) fvect[n] = 0;

                // put the samples into trainSet
                for (var n = 0; n < domain.length; n++) {
                    var bg = domain.substring(n, n + 1);
                    var p = alphabet.indexOf(bg);

                    if (p >= 0 && p <= alphabet.length) fvect[p] += 1;
                    else console.log("O-OU: "+ domain +"["+ n +"] = '"+ bg +"' > alphabet["+ p +"]");
                }
            }
            else {
                // create feature vector using transformed bigrams
                fvect = Array(bigrams.length);
                for (var n = 0; n < bigrams.length; n++) fvect[n] = 0;

                // put the samples into trainSet
                for (var n = 0; n < domain.length-1; n++) {
                    const bg = domain.substring(n, n + 2);
                    const p = bigrams.indexOf(bg);

                    if (p >= 0 && p <= bigrams.length) fvect[p] += 1;
                    else console.log("O-OU: "+ domain +"["+ n +"] = '"+ bg +"' > bigrams["+ p +"]");
                    
                }
            }

            // console.log("fvect "+ typeof(fvect[0]) +" = "+ fvect[0] +" print:"+ fvect);
            const sample = {"id": dom, "input": fvect, "output": [rep]};
            trainSet.push(sample);

            if (args.debug && i < 1) console.log(JSON.stringify(sample));
            if (i == inputCSV.length-1 || ((trainSet.length) % 1000 == 0)) {
                if (args.debug) console.log("samples: "+ trainSet.length +"\t "+ (JSON.stringify(trainSet).length/(1024*1024)).toFixed(3) +"M");
                else console.log("samples: "+ trainSet.length);
            }
        }

        // FS.writeFileSync(input+"transformed.csv", CSV.encode(trainSet), "utf8");
        console.log("... loaded in "+ ((Date.now() - start)/1000).toFixed(3) +" train-bigrams training ...");
        start = Date.now();

        // DOMAIN.train();
        var network = DOMAIN.train(trainSet);
        
        // print it - console.log(JSON.stringify(trainer));
        if (args.pretty) FS.writeFileSync(output, JSON.stringify(network, null, 2), "utf8");
        else FS.writeFileSync(output, JSON.stringify(network), "utf8");
        
        var evalSet = DOMAIN.eval(trainSet, network);
        // print it - console.log(JSON.stringify(trainer));
        if (args.pretty) FS.writeFileSync(output.slice(0, input.length-5)+"-eval.csv", CSV.encode(evalSet), "utf8");
        else FS.writeFileSync(output.slice(0, input.length-5)+"-eval.csv", CSV.encode(evalSet), "utf8");
        
        console.log("... done in "+ ((Date.now() - start)/1000).toFixed(3) +"s. Model: "+ output);
    } catch(e) {
        console.log(e.stack);
    }
}


//// test ------------------------------------------------------------------------
//if (args.main.includes("test")) {
//    if (args.test) input = args.test;
//    else if (args.input) input = args.input;
//    else input = test;
//    
//    output = input.slice(0, input.length-4) +".out";
//    if (args.output) output = args.output;
//    console.log("testing "+ input + " >> "+ output +" ...");
//    
//    try {  
//        // const inputData = FS.readFileSync(input, "utf8");
//        const inputCSV = CSV.decode(FS.readFileSync(input, "utf8"), ",");
//        // console.log("typeof inputCSV: "+ typeof inputCSV);
//        // console.log(JSON.stringify(inputCSV));
//        
//        // output ARRAY
//        const outputCSV = [];
//        
//        // domain,rep,pop,level,branches,leaves,cnt,pos,neg,psl,features
//        var keyDom = "domain";
//        if (args.key) key = args.key;
//        
//        // TODO: process args.array.split(",") 
//        var valPop = "pop";
//        var valNeg = "neg";
//        var valPos = "pos";
//        var valRep = "rep";
//        
//        var absErr = 0;
//        
//        // for (var obj in inputCSV) ... inputCSV is an array(!)
//        for(var i = 0; i < inputCSV.length; i++) {
//            const obj = inputCSV[i];            
//            if (args.debug && i < 10) console.log(JSON.stringify(obj));
//
//            const dom = obj[keyDom];
//            const pop = obj[valPop];
//            const neg = obj[valNeg];
//            const pos = obj[valPos];
//            const rep = obj[valRep];
//            
//            // process
//            
//            
//            // should return something like this:
//            const res = {};
//            res[keyDom] = dom;
//            res[valRep] = rep;
//            res["diff"] = (rep - rep); // less then 1, do not square
//            outputCSV.push(res);
//
//            if (args.debug && i < 10) console.log(res); // JSON.stringify
//        }
//        
//        // print it
//        FS.writeFileSync(output +".json", JSON.stringify(outputCSV, null, 2), "utf8");
//        FS.writeFileSync(output +".csv", CSV.encode(outputCSV), "utf8");
//        
//        console.log();
//        console.log("... done. Mean Square Error: "+ absErr/i +" of "+ i +" samples.");
//    } catch(e) {
//        console.log(e.stack);
//    }
//}
