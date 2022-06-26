let toggleButton = document.getElementById("toggleButton");
//let clearWhitelist = document.getElementById("clearWhiteList");

if (toggleButton) {
  toggleButton.addEventListener("click", toggle);
}

/**
* toggles autoClose function
*
* @returns {void}
*/

export async function toggle() {
  console.log("toggle");
  // get autoclose and its values from browser storage
  await chrome.storage.sync.get("autoClose");
  // set the setting to the html value
  await chrome.storage.sync.set({ autoClose: toggleButton.checked });
  //after settings are saved, update the html button's value to the set one
  updateButton();
}

/**
* updates button, that shows whether autoClose function is enabled 
*
* @returns {void}
*/

export function updateButton() {
  //get the value from browser storage
  let buttonVal = chrome.storage.sync.get("autoClose", val => {
    // if autoClose is not enabled yet or does not exist, disable it by default
    if (!val.autoClose || val.autoClose == null) {
      toggleButton.checked = false;
      //otherwise set it enable it
    } else {
      toggleButton.checked = true;
    }
  });
}

/**
* checks if there are duplicates in the blacklist
*
* @param {String} domain a domain to be checked for
* @param {String} regDom a regex domain
* @param {function} callback callback function for blacklist
* @returns {void}
*/

export function checkForDuplicates(domain, regDom, callback) {
  let blackListedSites;
  let whiteListedSites;

  // get blackListed sites from browser storage
  chrome.storage.sync.get("blackList", res => {
    // check if there are any blacklisted sites
    if (!res.blackList || res.blackList.length < 1) {
      blackListedSites = [];
      // parse blackListed sites to object
    } else {
      blackListedSites = JSON.parse(res.blackList);
    }
    // get whiteListed sites from browser storage
    chrome.storage.sync.get("whiteList", res => {
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

            chrome.storage.sync.set({
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

/**
* checks if there are duplicates in the whitelist
*
* @param {String} domain a domain to be checked for
* @param {String} regDom a regex domain
* @param {function} callback callback function for whitelist
* @returns {void}
*/

export function checkForDuplicatesWhitelist(domain, regDom, callback) {
  let whiteListedSites;
  let blackListedSites;

  // get whiteListed sites from browser storage
  chrome.storage.sync.get("whiteList", res => {
    // check if there are any blacklisted sites
    if (!res.whiteList || res.whiteList.left < 1) {
      whiteListedSites = [];
      // parse blackListed sites to object
    } else {
      whiteListedSites = JSON.parse(res.whiteList);
    }

    // get blackListed sites from browser storage
    chrome.storage.sync.get("blackList", res => {
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

            chrome.storage.sync.set({
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
* adds an url to the whitelist
*
* @param {String} url an url to be whitelisted
* @returns {void}
*/

export function addToWhiteList(url) {
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
      chrome.storage.sync.set({
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

/**
* return the blacklist
*
* @returns {Promise} returns the blacklist if available
*/

export function getBlacklist() {
  let blackListedSites;

  // get blackListed sites from browser storage
  chrome.storage.sync.get("blackList", res => {
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

/**
* return the whitelist
*
* @returns {Promise} returns the whitelist if available
*/

export function getWhitelist() {
  let whiteListedSites;

  // get whiteListed sites from browser storage
  chrome.storage.sync.get("whiteList", res => {
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
