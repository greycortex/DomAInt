// get html form used to add sites to blacklist
let blacklistForm = document.getElementById("form");

// get html form used to add sites to whitelist
let whitelistForm = document.getElementById("whitelistForm");


// add event listener on new submited url to be blacklisted
blacklistForm.addEventListener("submit", addSite);
// add event listener on new submited url to be whitelisted
whitelistForm.addEventListener("submit", addToWhiteList);



/**
 *function showBlacklistedSites is used to show sites that are being blacklisted on the settings page
 */
function showBlacklistedSites() {
  // get blacklisted sites from browser storage
  let blackList = browser.storage.local.get("blackList");
  blackList.then((res) => {
    // if theres no site being blacklisted
    if (!res.blackList || res.blackList.length < 1) {
      // set html div text:
      blackListdiv.innerText = "No blacklisted sites yet";
      // if there are blacklisted sites
    } else {
      // parse blacklisted sites to object
      let blackListArray = JSON.parse(res.blackList);
      // log the blacklisted sites
      console.log(blackListArray);
      // foreach blacklisted site
      blackListArray.forEach((site) => {
        // show what sites are being blocked in the html div
        blackListdiv.innerHTML += `<b>domain:</b> ${site.domain} <br> <b>regex search:</b> ${site.regex} <br>`;
      });
    }
  });
}

function showWhitelistedSites() {
   // get blacklisted sites from browser storage
   let whiteList = browser.storage.local.get("whiteList");
   whiteList.then((res) => {
     // if theres no site being blacklisted
     if (!res.whiteList || res.whiteList.length < 1) {
       // set html div text:
       whiteListdiv.innerText = "No whitelisted sites yet";
       // if there are blacklisted sites
     } else {
       // parse blacklisted sites to object
       let whiteListArray = JSON.parse(res.whiteList);
       // log the blacklisted sites
       console.log(whiteListArray);
       // foreach blacklisted site
       whiteListArray.forEach((site) => {
         // show what sites are being blocked in the html div
         whiteListdiv.innerHTML += `<b>domain:</b> ${site.domain} <br> <b>regex search:</b> ${site.regex} <br>`;
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

      let blackListedSites = checkForDuplicates(domain, regDom, function(blackListedSites) {
        console.log(blackListedSites);

      if(blackListedSites){

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
      }
      else {
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

      let whiteListedSites = checkForDuplicatesWhitelist(domain, regDom, function(whiteListedSites) {
        console.log(whiteListedSites)

        if(whiteListedSites) {
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

showBlacklistedSites();
showWhitelistedSites();
