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
    let autoClose = browser.storage.local.get("autoClose");
    autoClose.then((res) => {
        // set the setting to the html value
        let settings = browser.storage.local.set({
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
    let buttonVal = browser.storage.local.get("autoClose");
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
    let blackList = browser.storage.local.get("blackList");
    blackList.then((res) => {
        // check if there are any blacklisted sites
        if (!res.blackList || res.blackList.length < 1) {
            blackListedSites = [];
            // parse blackListed sites to object
        } else {
            blackListedSites = JSON.parse(res.blackList);
        }
        // get whiteListed sites from browser storage
        let whiteList = browser.storage.local.get("whiteList");
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

                        browser.storage.local.set({
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
    let whiteList = browser.storage.local.get("whiteList");
    whiteList.then((res) => {
        // check if there are any blacklisted sites
        if (!res.whiteList || res.whiteList.left < 1) {
            whiteListedSites = [];
            // parse blackListed sites to object
        } else {
            whiteListedSites = JSON.parse(res.whiteList);
        }

        // get blackListed sites from browser storage
        let blackList = browser.storage.local.get("blackList");
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

                        browser.storage.local.set({
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

function getBlacklist() {
    let blackListedSites;

    // get blackListed sites from browser storage
    let blackList = browser.storage.local.get("blackList");
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
    let whiteList = browser.storage.local.get("whiteList");
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
