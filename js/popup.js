// getting DOM elements from popup.html

// get cDomain button (used to add current site to the blacklist)
let currentToBlacklist = document.getElementById("cDomain");
// get whitelist button (used to add current site to the whitelist)
let currentToWhitelist = document.getElementById("whitelist");
// get options button (used to open extension's options page on a new tab)
let options = document.getElementById("options");
// get cDomain button (used to add current site to the blacklist)
let cDomain = document.getElementById("cDomain");

// adding listeners to DOM elements triggering their responsible functions
currentToBlacklist.addEventListener("click", addCurrent);
currentToWhitelist.addEventListener("click", addToWhiteList);
options.addEventListener("click", openOptions);

/**
 *function openOptions opens extension's settings page on a new tab
 */
function openOptions() {
  browser.runtime.openOptionsPage();
}

// if user clicks add current domain to blacklist on popup.html, this function is called
// this function parses url to regex used while comparing current url to the blacklisted ones
function addCurrent() {
    // get current url
    let currentDomain = browser.tabs.query({
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

          let domainList = checkForDuplicates(domain, regDom, function(domainList) {
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
        browser.storage.local.set({
          blackList: parsed,
        });
        console.log("succesfully added site to blacklist");
      } else {
        console.log("nah");
        return;
      }
    });
      }
    });
}
 


function addToWhiteList() {
 
   
    // get current url
    let currentDomain = browser.tabs.query({
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

          let domainList = checkForDuplicatesWhitelist(domain, regDom, function(domainList) {
            console.log(domainList);
          

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
        browser.storage.local.set({
          whiteList: parsed,
        });

      } else {
        return;
      }
    });
    }
    });
  
}
