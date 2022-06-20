import {checkForDuplicates, addToWhiteList} from "./mergedSettings"

let blackListdiv = document.getElementById("blacklist");
let whiteListdiv = document.getElementById("whitelist");

let blacklistForm = document.getElementById("form");
let whitelistForm = document.getElementById("whitelistForm");
let thresholdForm = document.getElementById("thresholdForm");
let apiForm = document.getElementById("apiForm");
let clear = document.getElementById("clear");
let clearWhitelist = document.getElementById("clearWhite");

/**
* Color elements, threshold ranges and values
* @type Element
*/
// grey is implicit
const green = document.getElementById("greenRange");
const orange = document.getElementById("orangeRange");
const red = document.getElementById("redRange");

let greenVal = document.getElementById("greenVal");
let orangeVal = document.getElementById("orangeVal");
let redVal = document.getElementById("redVal");

// div used to describe what will the threshold work like
let meaning = document.getElementById("meaning");

blacklistForm.addEventListener("submit", addSite);
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

/**
* retrieves all blacklisted sites from local storage
* and if there are any, display them to the html
* function also add event listener to each of the sites, so user might remove each one by one
*
* @returns {void}
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
* creates an array of url letter pairs
*
* @param {String} type blacklist/whitelist
* @param {String} id html id of the site
* @returns {void}
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

/**
* removes all sites from the blacklist
*
* @returns {void}
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
* removes all sites from the whitelist
*
* @returns {void}
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
* renders the whitelist and adds remove event listeners to each page
*
* @returns {void}
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
* adds site to the blacklist
*
* @returns {void}
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

    let blackListedSites = checkForDuplicates(domain, regDom, function (blackListedSites) {
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
* gets and saves user threshold settigns
*
* @returns {void}
*/

function configureThreshold() {
    const object = {green: green.value, orange: orange.value, red: red.value};

    // save threshold to the browser storage
    chrome.storage.local.set({
        threshold: JSON.stringify(object)
    });
}

/**
* renders threshold settings
*
* @returns {void}
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
* shows, how will the model work with such settings
*
* @returns {void}
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
* gets and saves API key
* @TODO hash or some sort of encryption
* @returns {void}
*/

function addAPIKey() {
    let APIKey = document.querySelector('input[name="apikey"]').value;
    console.log(APIKey);
    chrome.storage.local.set({
        apikey: JSON.stringify(APIKey)
    });
}

/**
* changes meaning value, moves sliders, so the valus dont collide
*
* @returns {void}
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

