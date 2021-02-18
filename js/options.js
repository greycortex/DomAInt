// get html form used to add sites to blacklist
let blacklistForm = document.getElementById("form");
// get html form used to add sites to whitelist
let whitelistForm = document.getElementById("whitelistForm");
// get html form used to configure custom AI threshold
let thresholdForm = document.getElementById("thresholdForm");
// get clear button (used to clear the whole blackList)
let clear = document.getElementById("clear");
// get clear button (used to clear the whole whiteList)
let clearWhitelist = document.getElementById("clearWhite");

/**
 * Color elements and values
 * @type Element
 */
const green = document.getElementById("greenRange");
// grey is implicit
const orange = document.getElementById("orangeRange");
const red = document.getElementById("redRange");

let greenVal = document.getElementById("greenVal");
// grey is implicit
let orangeVal = document.getElementById("orangeVal");
let redVal = document.getElementById("redVal");

// add event listener on new submited url to be blacklisted
blacklistForm.addEventListener("submit", addSite);
// add event listener on new submited url to be whitelisted
whitelistForm.addEventListener("submit", addToWhiteList);

thresholdForm.addEventListener("submit", configureThreshold);

clear.addEventListener("click", clearBLackList);
clearWhitelist.addEventListener("click", clearWhiteList);

/**
 *function showBlacklistedSites is used to show sites that are being blacklisted on the settings page
 */
function showBlacklistedSites() {
    // TODO: check if the user wants to get this info?
    
    // get blacklisted sites from browser storage
    let blackList = browser.storage.local.get("blackList");
    blackList.then((res) => {
        // if theres no site being blacklisted
        if (!res.blackList || res.blackList.length < 1) {
            // if there are blacklisted sites
        } else {
            // parse blacklisted sites to object
            let blackListArray = JSON.parse(res.blackList);
            // log the blacklisted sites
            // foreach blacklisted site
            blackListArray.forEach((site) => {
                // show what sites are being blocked in the html div
                blackListdiv.innerHTML += `<div class = "list-group-item">
        <img class = "favicon" src = "https://www.google.com/s2/favicons?domain=${site.regex}">
        <span class="domain">
        ${site.regex} 
        </span>
        <span class="removeButtonwhiteListList glyphicon glyphicon-remove">
        </div>`;
            });
        }
    });
}

/**
 *function clearBlacklist clear the whole URL UblackList
 */

function clearBLackList() {
    let empty = [];
    browser.storage.local.set({
        blackList: JSON.stringify(empty),
    });
    console.log("successfully cleared BlackList");
    if (blackListdiv) {
        blackListdiv.innerText = "";
    }
}

function clearWhiteList() {
    let empty = [];
    browser.storage.local.set({
        whiteList: JSON.stringify(empty),
    });
    console.log("successfully cleared whiteList");
    if (whiteListdiv) {
        whiteListdiv.innerText = "";
    }
}

function showWhitelistedSites() {
    // get blacklisted sites from browser storage
    let whiteList = browser.storage.local.get("whiteList");
    whiteList.then((res) => {
        // if theres no site being blacklisted
        if (!res.whiteList || res.whiteList.length < 1) {

            // if there are blacklisted sites
        } else {
            // parse blacklisted sites to object
            let whiteListArray = JSON.parse(res.whiteList);
            // log the blacklisted sites
            // foreach blacklisted site
            whiteListArray.forEach((site) => {
                // show what sites are being blocked in the html div
                whiteListdiv.innerHTML += `<div class = "list-group-item">
        <img class = "favicon" src = "https://www.google.com/s2/favicons?domain=${site.regex}">
        <span class="domain">
        ${site.regex} 
        </span>
        <span class="removeButtonwhiteListList glyphicon glyphicon-remove">
        </div>`;
            });
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

    let blackListedSites = checkForDuplicates(domain, regDom, function (
            blackListedSites
            ) {
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
            browser.storage.local.set({
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
 *function addSite gets URL value from html form user wishes to whitelist
 */
function addToWhiteList() {
    // get  value from form input
    let domain = document.querySelector('input[name="whitelistUrl"]').value;
    // parse full url to domain adress only
    let regDom = domain
            .replace("http://", "")
            .replace("https://", "")
            .replace("www.", "")
            .split(/[/?#]/)[0];

    let whiteListedSites = checkForDuplicatesWhitelist(domain, regDom, function (
            whiteListedSites
            ) {
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
            browser.storage.local.set({
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

function configureThreshold() {
    const object = {green: green.value, orange: orange.value, red: red.value};

    // save threshold to the browser storage
    browser.storage.local.set({
        threshold: JSON.stringify(object),
    });
}

function showThreshold() {
    // get blacklisted sites from browser storage
    let threshold = browser.storage.local.get("threshold");
    threshold.then((res) => {
        // if theres no site being blacklisted
        if (!res.threshold || res.threshold.length < 1) {
            green.value = 10;
            greenVal.innerText = 10 + " %";
            
            // grey is implicit
            
            orange.value = 60;
            orangeVal.innerText = 60 + " %";

            red.value = 90;
            redVal.innerText = 90 + " %";

        } else {
            // parse blacklisted sites to object
            let threshold = JSON.parse(res.threshold);
            // log the blacklisted sites
            console.log(threshold);

            green.value = threshold.green;
            greenVal.innerText = green.value + " %";

            orange.value = threshold.orange;
            orangeVal.innerText = orange.value + " %";

            red.value = threshold.red;
            redVal.innerText = red.value + " %";
        }
    });
}

showBlacklistedSites();
showWhitelistedSites();
showThreshold();


green.oninput = function () {
    greenVal.innerText = green.value + " %";
    if (+green.value < +orange.value && +orange.value > 1) {
        orange.value = +green.value - 1;
        orangeVal.innerText = orange.value + " %";
    }
    if (+orange.value < +red.value && +red.value > 1) {
        red.value = +orange.value - 1;
        redVal.innerText = red.value + " %";
    }
};

orange.oninput = function () {
    orangeVal.innerText = orange.value + " %";

    if (+orange.value > +green.value) {
        green.value = +orange.value + 1;
        greenVal.innerText = green.value + " %";
    }

    if (+orange.value < +red.value) {
        red.value = orange.value - 1;
        redVal.innerText = red.value + " %";
    }
};

red.oninput = function () {
    redVal.innerText = red.value + " %";
    if (+red.value > +orange.value) {
        orange.value = +red.value + 1;
        orangeVal.innerText = orange.value + " %";
    }
    if (+orange.value > +green.value && +green.value <= 99) {
        green.value = +orange.value + 1;
        greenVal.innerText = green.value + " %";
    }
};
