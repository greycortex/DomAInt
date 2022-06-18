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
/*!************************!*\
  !*** ./src/options.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _mergedSettings__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mergedSettings */ "./src/mergedSettings.js");


let blackListdiv = document.getElementById("blacklist");
let whiteListdiv = document.getElementById("whitelist");

// get html form used to add sites to blacklist
let blacklistForm = document.getElementById("form");
// get html form used to add sites to whitelist
let whitelistForm = document.getElementById("whitelistForm");
// get html form used to configure custom AI threshold
let thresholdForm = document.getElementById("thresholdForm");
// get html form used to setup virustotal API calls
let apiForm = document.getElementById("apiForm");
// get clear button (used to clear the whole blackList)
let clear = document.getElementById("clear");
// get clear button (used to clear the whole whiteList)
let clearWhitelist = document.getElementById("clearWhite");

/**
 * Color elements, threshold ranges and values
 * @type Element
 */
const green = document.getElementById("greenRange");
// grey is implicit
const orange = document.getElementById("orangeRange");
const red = document.getElementById("redRange");

// get html range values
let greenVal = document.getElementById("greenVal");
// grey is implicit
let orangeVal = document.getElementById("orangeVal");
let redVal = document.getElementById("redVal");

// div used to describe what will the threshold work like
let meaning = document.getElementById("meaning");

// add event listener on new submited url to be blacklisted
blacklistForm.addEventListener("submit", addSite);
// add event listener on new submited url to be whitelisted
whitelistForm.addEventListener("submit", function() {
  let domain = document.querySelector('input[name="whitelistUrl"]').value;
  addToWhiteList(domain);
});

apiForm.addEventListener("submit", addAPIKey);

thresholdForm.addEventListener("submit", configureThreshold);

clear.addEventListener("click", clearBLackList);
clearWhitelist.addEventListener("click", clearWhiteList);


/**
 * function showBlacklistedSites retrieves all blacklisted sites from local storage
 * and if there are any, display them to the html
 * function also add event listener to each of the sites, so user might remove each one by one
 */
function showBlacklistedSites() {
    // TODO: check if the user wants to get this info?
    
    // get blacklisted sites from browser storage
    let blackList = chrome.storage.local.get("blackList");
    blackList.then((res) => {
        // if theres no site being blacklisted
        if (!res.blackList || res.blackList.length < 1) {
            // if there are blacklisted sites
        } else {
            // parse blacklisted sites to object
            let blackListArray = JSON.parse(res.blackList);
            // log the blacklisted sites
            // foreach blacklisted site
            let i = 0;
            blackListArray.forEach((site) => {
                // show what sites are being blocked in the html div
                blackListdiv.innerHTML += `<div class = "list-group-item">
<img class = "favicon" src = "https://www.google.com/s2/favicons?domain=${site.regex}">
<span class="domain">
${site.regex} 
</span>
<span class="removeFromListBlacklist" id="${i}">
<svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-x" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>
</span>
</div>`;
                i++;
            });

            // TODO: Comment this pls
            let removeFromList = document.getElementsByClassName("removeFromListBlacklist");
            console.log(removeFromList.length);
            for (let i = 0; i<removeFromList.length; i++) {
                console.log(removeFromList[i]);
                removeFromList[i].addEventListener("click", function() {
                    console.log(removeFromList[i]);
                    removeSiteFromLists("blacklist", removeFromList[i].id);
                })
            }
        }
    });
}



/**
  * removes single site from blacklist or whitelist
  *
  * @param {string} type - either blacklist or whitelist
  * @returns {string} id - html id of the site
  */
function removeSiteFromLists(type, id) {
    if (type == "whitelist") {
        let whiteListedSites;
        // get blackListed sites from browser storage
        let whiteList = chrome.storage.local.get("whiteList");
        whiteList.then((res) => {
        // check if there are any blacklisted sites
        if (!res.whiteList || res.whiteList.left < 1) {
        whiteListedSites = [];
                // parse blackListed sites to object
        } else {
        whiteListedSites = JSON.parse(res.whiteList);
        }
        whiteListedSites.splice(id, 1);
                chrome.storage.local.set({
                whiteList: JSON.stringify(whiteListedSites),
                });
        });
    }
    else if (type == "blacklist") {
        let blackListedSites;
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
        blackListedSites.splice(id, 1);
                chrome.storage.local.set({
                blackList: JSON.stringify(blackListedSites),
                });
        });
    }
    location.reload();
}


/**
 *function clearBlacklist removes all sites from the blacklist
 */

function clearBLackList() {
    let empty = [];
    chrome.storage.local.set({
        blackList: JSON.stringify(empty),
    });
    console.log("successfully cleared BlackList");
    if (blackListdiv) {
        blackListdiv.innerText = "";
    }
}

/**
 * function clearWhiteList removes all sites from the whitelist
 */
function clearWhiteList() {
    let empty = [];
    chrome.storage.local.set({
        whiteList: JSON.stringify(empty),
    });
    console.log("successfully cleared whiteList");
    if (whiteListdiv) {
        whiteListdiv.innerText = "";
    }
}



/**
 * renders each whitelisted site from local storage in the option html
 * also adds event listeners, so that pages can be removed one by one
 */
function showWhitelistedSites() {
    // get blacklisted sites from browser storage
    let whiteList = chrome.storage.local.get("whiteList");
    whiteList.then((res) => {
        // if theres no site being blacklisted
        if (!res.whiteList || res.whiteList.length < 1) {

            // if there are blacklisted sites
        } else {
            // parse blacklisted sites to object
            let whiteListArray = JSON.parse(res.whiteList);
            // log the blacklisted sites
            // foreach blacklisted site
            let i = 0;
            whiteListArray.forEach((site) => {
                // show what sites are being blocked in the html div
                whiteListdiv.innerHTML += `<div class = "list-group-item">
<img class = "favicon" src = "https://www.google.com/s2/favicons?domain=${site.regex}"> <span class="domain">
${site.regex} 
</span>
<span class="removeFromList" id="${i}">
<svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-x" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>
</span>
</div>`;
                i++;
            });
            let removeFromList = document.getElementsByClassName("removeFromList");
            console.log(removeFromList.length);
            for (let i = 0; i < removeFromList.length; i++) {
                console.log(removeFromList[i]);
                removeFromList[i].addEventListener("click", function () {
                    console.log(removeFromList[i]);
                    removeSiteFromLists("whitelist", removeFromList[i].id);
                })
            }
        }
    });
}


/**
 *function addSite gets URL value from html form user wishes to blacklist
 */
function addSite() {
    // get  value from form input
    let domain = document.querySelector('input[name="url"]').value;
    // declare variable for blackListed sites -> global scope variable

    // parse full url to domain adress only
    let regDom = domain
            .replace("http://", "")
            .replace("https://", "")
            .replace("www.", "")
            .split(/[/?#]/)[0];

    let blackListedSites = (0,_mergedSettings__WEBPACK_IMPORTED_MODULE_0__.checkForDuplicates)(domain, regDom, function (blackListedSites) {
        console.log(blackListedSites);

        if (blackListedSites) {
            // create object made of full URL and parsed URL
            const object = {
                domain: domain,
                regex: regDom,
            };

            // push the previous object to the existing blacklist
            blackListedSites.push(object);

            // save blackListed sites to the browser storage
            chrome.storage.local.set({
                blackList: JSON.stringify(blackListedSites),
            });

            //log if succesfully accomplished
            //TODO create some sort of flash message to popup and options page
            console.log("succesfully added domain to the blacklist");
        } else {
            return;
        }
    });
}



/**
 * function configureThreshold saves the threshold from settings from to he local storage
 */
function configureThreshold() {
    const object = {green: green.value, orange: orange.value, red: red.value};

    // save threshold to the browser storage
    chrome.storage.local.set({
        threshold: JSON.stringify(object)
    });
}

/**
 * on site load, this function shows Threshold settings from local storage or the default ones
 */
function showThreshold() {
    // get blacklisted sites from browser storage
    let threshold = chrome.storage.local.get("threshold");
    threshold.then((res) => {
        // if theres no site being blacklisted
        if (!res.threshold || res.threshold.length < 1) {
            green.value = 20;
            greenVal.innerText = 20 + "%";

            orange.value = 60;
            orangeVal.innerText = 60 + "%";

            red.value = 90;
            redVal.innerText = 90 + "%";
        } else {
            // parse blacklisted sites to object
            let threshold = JSON.parse(res.threshold);
            // log the blacklisted sites
            console.log(threshold);

            green.value = threshold.green;
            greenVal.innerText = green.value + "%";

            orange.value = threshold.orange;
            orangeVal.innerText = orange.value + "%";

            red.value = threshold.red;
            redVal.innerText = red.value + "%";

        }
        editMeaning();
    });
}

/**
 * desribes what will model work like with current Threshold configuration
 */

function editMeaning() {
    meaning.innerHTML = "<p>";
    meaning.innerText += `According to these settings, the model will work as follows: 
Till ${green.value}% the site will be rated as safe.
Between the green and the orange value, there is the grey area, we don't know much about.'
From ${orange.value}% to ${red.value}% the site will be rated as potencionaly dangerous.
From ${red.value}% on, the site will be rated as dangerous.
`;
}

/**
 * takes apikey value from form and saves it to the local storage // might not be the best solution
 */
function addAPIKey() {
    let APIKey = document.querySelector('input[name="apikey"]').value;
    console.log(APIKey);
    chrome.storage.local.set({
        apikey: JSON.stringify(APIKey)
    });
}


/*
 * oninput section for all 3 threshold sliders, moves other sliders if necessary, changes text value
 */
green.oninput = function () {
    greenVal.innerText = green.value + "%";
    if (+green.value > +orange.value) {
        orange.value = +green.value + 1;
        orangeVal.innerText = orange.value + "%";
    }
    if (+orange.value > +red.value && +red.value <= 99) {
        red.value = +orange.value + 1;
        redVal.innerText = red.value + "%";
    }
    editMeaning();
};

orange.oninput = function () {
    orangeVal.innerText = orange.value + "%";

    if (+orange.value > +red.value) {
        red.value = +orange.value + 1;
        redVal.innerText = red.value + "%";
    }

    if (+orange.value < +green.value) {
        green.value = orange.value - 1;
        greenVal.innerText = green.value + "%";
    }
    editMeaning();
};

red.oninput = function () {
    redVal.innerText = red.value + "%";
    if (+red.value < +orange.value && +orange.value > 1) {
        orange.value = +red.value - 1;
        orangeVal.innerText = orange.value + "%";
    }
    if (+orange.value < +green.value && +green.value > 1) {
        green.value = +orange.value - 1;
        greenVal.innerText = green.value + "%";
    }
    editMeaning();
};


  



// TODO: Comment the output
showBlacklistedSites();
showWhitelistedSites();
showThreshold();


})();

/******/ })()
;
//# sourceMappingURL=options.js.map