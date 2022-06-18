/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/mergedSettings.js":
/*!*******************************!*\
  !*** ./src/mergedSettings.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "addToWhiteList": () => (/* binding */ addToWhiteList),
/* harmony export */   "checkForDuplicates": () => (/* binding */ checkForDuplicates),
/* harmony export */   "checkForDuplicatesWhitelist": () => (/* binding */ checkForDuplicatesWhitelist),
/* harmony export */   "getBlacklist": () => (/* binding */ getBlacklist),
/* harmony export */   "getWhitelist": () => (/* binding */ getWhitelist),
/* harmony export */   "toggle": () => (/* binding */ toggle),
/* harmony export */   "updateButton": () => (/* binding */ updateButton)
/* harmony export */ });
// getting DOM elements from popup.html

// get toggleButton (used to enable/disable autoClose)
let toggleButton = document.getElementById("toggleButton");
//let clearWhitelist = document.getElementById("clearWhiteList");

let blackListdiv = document.getElementById("blacklist");
let whiteListdiv = document.getElementById("whitelist");

// adding listeners to DOM elements triggering their responsible functions
if (toggleButton) {
    toggleButton.addEventListener("click", toggle);
}
/**
 
 *toggle function is responsible for turning off/on blacklist site autoclose
 *and saving the value to the local storage
 */
function toggle() {
    console.log("toggle");
    // get autoclose and its values from browser storage
    let autoClose = chrome.storage.local.get("autoClose");
    autoClose.then((res) => {
        // set the setting to the html value
        let settings = chrome.storage.local.set({
            autoClose: toggleButton.checked
        });
        //after settings are saved, update the html button's value to the set one
        settings.then(function () {
            updateButton();
        });
    });
}

/**
 * function updateButton is called when on optionsPage, when the autoClose settings are changed
 */
function updateButton() {
    //get the value from browser storage
    let buttonVal = chrome.storage.local.get("autoClose");
    buttonVal.then((val) => {
        // if autoClose is not enabled yet or does not exist, disable it by default
        if (!val.autoClose || val.autoClose == null) {
            toggleButton.checked = false;
            //otherwise set it enable it
        } else {
            toggleButton.checked = true;
        }
    });
}


function checkForDuplicates(domain, regDom, callback) {
    let blackListedSites;
    let whiteListedSites;

    // get blackListed sites from browser storage
    let blackList = chrome.storage.local.get("blackList");
    blackList.then((res) => {
        // check if there are any blacklisted sites
        if (!res.blackList || res.blackList.length < 1) {
            blackListedSites = [];
            // parse blackListed sites to object
        } else {
            blackListedSites = JSON.parse(res.blackList);
        }
        // get whiteListed sites from browser storage
        let whiteList = chrome.storage.local.get("whiteList");
        whiteList.then((res) => {
            // check if there are any blacklisted sites
            if (!res.whiteList || res.whiteList.left < 1) {
                whiteListedSites = [];
                // parse blackListed sites to object
            } else {
                whiteListedSites = JSON.parse(res.whiteList);
            }

            //check if site, user wishes to block is not already blocked
            if (blackListedSites.some(e => e["domain"] === domain) || blackListedSites.some(x => x["regex"] === regDom)) {
                //log if so
                //TODO create some sort of flash message to popup and options page
                console.log("this site is already being blocked");
                return;
            } else {
                for (let j = 0; j < whiteListedSites.length; j++) {
                    if (whiteListedSites[j]["domain"] == domain || whiteListedSites[j]["regex"] == regDom) {
                        console.log(`removed ${whiteListedSites[j]["domain"]} from the whitelist`);
                        whiteListedSites.splice(j, 1);

                        chrome.storage.local.set({
                            whiteList: JSON.stringify(whiteListedSites),
                        });
                        break;
                    }
                }
            }


            console.log(blackListedSites);
            callback(blackListedSites);
        });
    });

}


function checkForDuplicatesWhitelist(domain, regDom, callback) {
    let whiteListedSites;
    let blackListedSites;

    // get whiteListed sites from browser storage
    let whiteList = chrome.storage.local.get("whiteList");
    whiteList.then((res) => {
        // check if there are any blacklisted sites
        if (!res.whiteList || res.whiteList.left < 1) {
            whiteListedSites = [];
            // parse blackListed sites to object
        } else {
            whiteListedSites = JSON.parse(res.whiteList);
        }

        // get blackListed sites from browser storage
        let blackList = chrome.storage.local.get("blackList");
        blackList.then((res) => {
            // check if there are any blacklisted sites
            if (!res.blackList || res.blackList.left < 1) {
                blackListedSites = [];
                // parse blackListed sites to object
            } else {
                blackListedSites = JSON.parse(res.blackList);
            }

            //check if site, user wishes to block is not already blocked
            if (whiteListedSites.some(e => e["domain"] === domain) || whiteListedSites.some(x => x["regex"] === regDom)) {
                //log if so
                //TODO create some sort of flash message to popup and options page
                console.log("this site is already in the whitelist");
                return;
            } else {
                for (let j = 0; j < blackListedSites.length; j++) {
                    if (blackListedSites[j]["domain"] == domain || blackListedSites[j]["regex"] == regDom) {
                        console.log(`removed ${blackListedSites[j]["domain"]} from the blacklist`);
                        blackListedSites.splice(j, 1);

                        chrome.storage.local.set({
                            blackList: JSON.stringify(blackListedSites),
                        });
                        break;
                    }
                }
            }

            console.log(whiteListedSites);
            callback(whiteListedSites);

        });
    });
}



/**
 *function addSite gets URL value from html form user wishes to whitelist
 */
function addToWhiteList(url) {
    let domain = url;
    // parse full url to domain adress only
    let regDom = domain
            .replace("http://", "")
            .replace("https://", "")
            .replace("www.", "")
            .split(/[/?#]/)[0];

    let whiteListedSites = checkForDuplicatesWhitelist(domain, regDom, function (whiteListedSites) {
        console.log(whiteListedSites);

        if (whiteListedSites) {
            // create object made of full URL and parsed URL
            const object = {
                domain: domain,
                regex: regDom,
            };

            // push the previous object to the existing whitelist
            whiteListedSites.push(object);

            // save whiteListed sites to the browser storage
            chrome.storage.local.set({
                whiteList: JSON.stringify(whiteListedSites),
            });

            //log if succesfully accomplished
            //TODO create some sort of flash message to popup and options page
            console.log("succesfully added domain to the whiteList");
        } else {
            return;
        }
    });
}

function getBlacklist() {
    let blackListedSites;

    // get blackListed sites from browser storage
    let blackList = chrome.storage.local.get("blackList");
    blackList.then((res) => {
        // check if there are any blacklisted sites
        if (!res.blackList || res.blackList.length < 1) {
            blackListedSites = [];
            // parse blackListed sites to object
        } else {
            blackListedSites = JSON.parse(res.blackList);
        }

        return new Promise(function (resolve, reject) {
            if (blackListedSites) {
                resolve(blackListedSites);
            } else {
                reject(new Error("could not return the blacklist"));
            }
        });
    });
}

function getWhitelist() {
    let whiteListedSites;

    // get whiteListed sites from browser storage
    let whiteList = chrome.storage.local.get("whiteList");
    whiteList.then((res) => {
        // check if there are any whitelisted sites
        if (!res.whiteList || res.whiteList.length < 1) {
            whiteListedSites = [];
            // parse whiteListed sites to object
        } else {
            whiteListedSites = JSON.parse(res.whiteList);
        }

        return new Promise(function (resolve, reject) {
            if (whiteListedSites) {
                resolve(whiteListedSites);
            } else {
                reject(new Error("could not return the whitelist"));
            }
        });
    });
}

if (toggleButton) {
    updateButton();
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/popup.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _mergedSettings__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mergedSettings */ "./src/mergedSettings.js");


// getting DOM elements from popup.html

// get cDomain button (used to add current site to the blacklist)
let currentToBlacklist = document.getElementById("cDomain");
// get whitelist button (used to add current site to the whitelist)
let currentToWhitelist = document.getElementById("whitelist");
// get options button (used to open extension's options page on a new tab)
let options = document.getElementById("options");
// get cDomain button (used to add current site to the blacklist)
let cDomain = document.getElementById("cDomain");

let virustotalDiv = document.getElementById("virustotalDiv");
let statusDiv = document.getElementById("statusDiv");

let navbar = document.getElementById("navbar");
let classToggler = document.getElementById("classToggler");

classToggler.addEventListener("click", () => {
  navbar.classList.toggle("navbar-change");

  classToggler.classList.toggle('up');
  classToggler.classList.toggle('up-scroll');
  classToggler.classList.toggle('down');
  
  virustotalDiv.classList.toggle('virustotalDivScroll');
});






//  will listen for popup open and then send request to the virustotal api with the current url if possible

document.addEventListener('DOMContentLoaded', function () {
  // only get domain, not full url
  let currentDomain = chrome.tabs.query({
    currentWindow: true,
    active: true,
  });
  currentDomain.then((tab) => {
    postVirustotalAPIRequest(tab[0].url);
    console.log(tab[0].url);
  });
});


// adding listeners to DOM elements triggering their responsible functions
currentToBlacklist.addEventListener("click", addCurrent);
currentToWhitelist.addEventListener("click", function() {
  // get current url
  let currentDomain = chrome.tabs.query({
    currentWindow: true,
    active: true,
  });
  currentDomain.then((tab) => {
    const domain = tab[0].url;
    (0,_mergedSettings__WEBPACK_IMPORTED_MODULE_0__.addToWhiteList)(domain);
  });
});
options.addEventListener("click", openOptions);

/**
 *function openOptions opens extension's settings page on a new tab
 */
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// if user clicks add current domain to blacklist on popup.html, this function is called
// this function parses url to regex used while comparing current url to the blacklisted ones
function addCurrent() {
    // get current url
    let currentDomain = chrome.tabs.query({
      currentWindow: true,
      active: true,
    });
    currentDomain.then((tab) => {
      const domain = tab[0].url;

      if (domain.startsWith("http")) {
        // use regex to parse the url, so we can use it for comparing
        let regDom = domain
          .replace("http://", "")
          .replace("https://", "")
          .replace("www.", "")
          .split(/[/?#]/)[0];

          let domainList = (0,_mergedSettings__WEBPACK_IMPORTED_MODULE_0__.checkForDuplicates)(domain, regDom, function(domainList) {
            console.log(domainList)
          

          if(domainList) {
        // create object constisting of full url and the parsed one
        let object = {
          domain: domain,
          regex: regDom,
        };

        // add it to the blacklisted list and save it to local storage
        domainList.push(object);

        let parsed = JSON.stringify(domainList);
        console.log(parsed);
        chrome.storage.local.set({
          blackList: parsed,
        });
        console.log("succesfully added site to blacklist");
      } else {
        console.log("List could not be retrieved");
        return;
      }
    });
      }
    });
}

function getApiKey() {
    return new Promise(function(resolve, reject) {
      let getKey = chrome.storage.local.get("apikey");
          getKey.then((res) => {
      if(res.apikey) {
        resolve(res.apikey);
      } else {
        reject(new Error("There is no ApiKey set in the storage"));
      }
    });
  });
}

/**
       * Returns getVirusTotalAPIResults function call = we firstly need to post the url to examine
       * the api then returns an id, where we get the final result using GET request
       *
       * @param {string} url - url that is going to be POSTed to the API
       * @returns {function call} calls function which retrieves the scan result
       */

       
      async function postVirustotalAPIRequest(url) {
        let X_APIKey = await getApiKey(); 
        X_APIKey = X_APIKey.replaceAll('"', "");
        
        const body = new FormData();
        body.append("url", url);
      
        const data = new URLSearchParams();
        for (const pair of body) {
          data.append(pair[0], pair[1]);
        }
      
        fetch("https://www.virustotal.com/api/v3/urls", {
          body: data,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Apikey":X_APIKey
          },
          method: "POST"
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(url);
            if(data){
            getVirustotalAPIResults(data.data.id, X_APIKey, url)
          }
          });
      }
     
      /**
       * Returns JSON result of a previous url scan
       *
       * @param {string} id - this id corresponds to the scan we POSTed and want to retrieve the results of
       * @param {string} X_APIKey - virustotal API auth API key
       * @param {string} url - url that was POSTed to the API
       * 
       * @returns {function call} returns json scan result of the url posted
       */
      
      function getVirustotalAPIResults(id, X_APIKey, url) {   
        console.log(url)
        console.log(`id ${id}`);
          fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, {
              headers: {
                  "X-Apikey":`${X_APIKey}`
                },
              method: "GET"
            })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              showVirutstotalAPIResults(data, url, id)
            }); 
      }

      /**
       * Parses Virustotal API results and calls addClass function depending on the result
       *
       * @param {string} takes an id from the previous function. That id corresponds with the final json result
       * @param {string} url - examined url, used to display it in the popup
       * 
       * @returns {function call} calls addClass function 
       */

      function showVirutstotalAPIResults(data, url, id) {
        let stats = data.data.attributes.stats;
        console.log(stats);

        let antiVirusCount = +stats.harmless + +stats.malicious + +stats.suspicious;
        console.log(antiVirusCount);
/*
        if(antiVirusCount == 0) {
          virustotalDiv.innerHTML = "failed to fetch";
        }
*/
        if(stats.harmless > stats.malicious && stats.harmless > stats.suspicious) {
          let percent = Math.round(stats.harmless/antiVirusCount*100);
          //virustotalDiv.innerHTML = `Virustotal url scan: <br> ${stats.harmless} out of ${antiVirusCount} consider ${url} <br> harmless`;
          virustotalDiv.innerHTML = `<h1>${percent}%</h1>`
          statusDiv.innerHTML = "<h5>harmless</h5>";
          return addClass("green");
        }
        
        else if(stats.suspicious > stats.harmless && stats.suspicious > stats.malicious) {
          let percent = Math.round(stats.suspicious/antiVirusCount*100);
          //virustotalDiv.innerHTML = `<br> ${stats.suspicious} out of ${antiVirusCount} consider ${url} suspicious`;
          virustotalDiv.innerHTML = `<h1>${percent}%</h1>`
          return addClass("Yellow");
        }

        else if(stats.malicious > stats.harmless && stats.malicious > stats.suspicious) {
          let percent = Math.round(stats.malicious/antiVirusCount*100);
          //virustotalDiv.innerHTML = `<br> ${stats.malicious} out of ${antiVirusCount} consider ${url} malicious`;
          virustotalDiv.innerHTML = `<h1>${percent}%</h1>`
          return addClass("Red");
        }
      }

       /**
       * 
       *  Adds predefined CSS class to fillbox element in order to trigger water like animation
       *  to display virustotal result percentage
       * 
       */

      function addClass(color) {
        let fillBox = document.getElementById("fillBox");

        switch(color) {
          case "green":
            fillBox.classList.add("fillBoxGreen"); 
            break;
          case "orange":
            fillBox.classList.add("fillBoxOrange"); 
            break;
          case "red":
            fillBox.classList.add("fillBoxRed"); 
            break;
        }
      }
 



})();

/******/ })()
;
//# sourceMappingURL=popup.js.map