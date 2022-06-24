/*
var global = (function(g){
    return g;
}(this))
*/
//const browser = require("webextension-polyfill");
import * as tf from "@tensorflow/tfjs";
import { Domain } from "./domainClass";
import { escapeHTML } from "./replaceFunctions";
import { findBigrams, bigramsToInt } from "./bigramFunctions";
import { getCurrentURL, showAfterClosePopup, closeTab, changeIcon, resetIcon, setIcon } from "./tabFunctions";

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


// load and prepare the model of up to 44 overlapping bigrams trained from github 
const MODEL_PATH = "https://raw.githubusercontent.com/greycortex/DomAInt/rnn/models/domain_bigrams-lstm/model.json";
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


    chrome.storage.local.get("blackList", res => {
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
            chrome.storage.local.get("autoClose", res => {
              // if autoClose is enabled by the user continue, else stop
              if (res.autoClose == true) {
                // get array of blacklisted sites
                let currentDomain = chrome.tabs.query({
                  currentWindow: true,
                  active: true,
                });
                currentDomain.then(async (tab) => {
                  const closeSite = tab[0].id;
                  console.log(`close site ${closeSite}`);
                  const closedSiteUrl = tab[0].url;
                  let close = await closeTab(closeSite);
                  lastClosedSite = closedSiteUrl;
                  showAfterClosePopup();
                });
                // return if autoClose is not enabled
              }
              chrome.action.setTitle({
                title: "This site is blacklisted",
              });
              // set extension icon to green
              chrome.action.setIcon({
                path: "/assets/img/gb.png",
              });
              next = false;
            });

          }
        });
        // return if there's no blacklist
      }
    });



    chrome.storage.local.get("whiteList", res => {
      // if whitelist exists
      if (res.whiteList) {
        // parse blacklist to object
        const whiteList = JSON.parse(res.whiteList);

        // compare each blacklisted sites to the one being accessed
        whiteList.forEach((site) => {
          // compare blacklisted site to the one being accessed
          if (
            adress.toLowerCase() == site.regex || domainControl.toLowerCase() == site.regex
          // if accesed site is blacklisted, use close function to close it
          ) {
            // get autoclose function settings from browser storage
            chrome.action.setTitle({
              title: "This site is whitelisted",
            });
            // set extension icon to green
            chrome.action.setIcon({
              path: "/assets/img/base.png",
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
            console.log(Result);
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



async function createDomainrunModel(adress, source = "background") {

  console.log("adress in func is " + adress + " from source " + source);
  let domain = new Domain(adress);

  // regex domain, having replaced certain values replaced for model usage
  // slice domain, so we can create model input
  let sliced = findBigrams(domain.name);
  // from sliced URL, generate model input
  const modelInput = bigramsToInt(sliced);

  //FIXME: runModel isnt returning Promise
  let output = runModel(modelInput);
  output.then(async (res) => {
    // log prediction
    console.log(res);
    if (source == "background") {
      // set cached result
      Result = res;
      // change icon according to the Result (danger icon, ...)
      changeIcon(Result);
    }
    else if (source == "contextMenu") {

      await chrome.action.setTitle({ title: "DomAInT by GreyCortex" });

      let currentTitle = await chrome.action.getTitle({});

      console.log(`title is ${currentTitle}`);
      let newTitle = currentTitle;

      newTitle += `\n result from context menu for adress ${adress} is ${100 - Math.round(res * 100)}% safe`;

      chrome.action.setTitle({ title: newTitle });
    }
  });
}

/**
 * Creates a context menu, which is navigated to using the right mouse click (only works on links)
*/

chrome.contextMenus.create({
  id: "analyze-link",
  title: "Analyze link using DomAInt",
  contexts: ["link"],
});


/**
* sends the link from context menu to createDomainrunModel function
*
* @listens contextMenus.onClicked listens for click on the context menu option 
* @returns {void}
*/

chrome.contextMenus.onClicked.addListener((info) => {
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
* @listens runtime.onMessage for "continue_once" message  
* @returns {Promise} resolves debug string
*/

/*
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.msg === "continue_once") {
            isAfterClose = true;
            console.log("changed to true");
            chrome.tabs.create({ url: lastClosedSite });
            setTimeout(() => {
                isAfterClose = false;
            }, 5000)
            return Promise.resolve(`tab with url ${lastClosedSite} created`);
        }
    }
);
*/

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  if (message === "continue_once") {
    isAfterClose = true;
    console.log("isAfterClose changed to true");
    chrome.tabs.create({ url: lastClosedSite });
    setTimeout(() => {
      isAfterClose = false;
    }, 5000);
    sendResponse(`tab with url ${lastClosedSite} created`);
  }
});


/**
* sends the url of site that was closed
* @listens runtime.onMessage for "send_url" message  
* @returns {void}
*/


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  if (message === "send_url") {
    console.log(`lastClosedSite is: ${lastClosedSite}`);
    sendResponse(lastClosedSite);
  }
});

/**
* calls runCode when the active tab changes
* @listens tabs.onUpdated triggers when the active tab changes  
* @returns {Promise} resolves debug string
*/

chrome.tabs.onUpdated.addListener(function (tabid, changeinfo, tab) {
  // might replace the function that gets the url
  let url = tab.url;
  if (url !== undefined && changeinfo.status == "loading" && !isAfterClose) {
    runCode();
  }
});

/**
* calls runCode when new url is entered
* @listens tabs.onActivated triggers, when new url is entered
* @returns {void}
*/

chrome.tabs.onActivated.addListener(function () {
  if (!isAfterClose) {
    console.log("fired");
    runCode();
  }
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
