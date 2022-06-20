/*
 * GREYCORTEX Research DomAIn
 * Update mechanism for browser and node.js.
 * 
 * Default file names: [model|suffix|dict]-v[0-9]+-$YYYYMMDD??$.[json|csv]
 * 
 * Copyright (c) GREYCORTEX Research 2019
 */

// https://github.com/adaltas/node-csv
// const csv = require("csv");

// https://github.com/avoidwork/csv.js
const csvjs = require("./csv.js/csv.js");

// https://nodejs.org/docs/latest-v8.x/api/fs.html
const fs = require("fs");

// download model first (at least daily, 3times then)
var model  = "../data/model.json";
// there will be specified other files to download...
var suffix = "../data/suffix.json"; // about 10k records ~ 290kB (-min) - on demand, eg. weekly
var dict   = "../data/dict.json"; // this will change once a while... 50k records ~ 1.7MB (-min) - on demand, eg. monthly

// The decision to update suffixes and dictionary is based on the test performance - once it starts degenerate, new files are generated.
