// get html div used to show blacklisted sites to the user on extension settings site
let blackListdiv = document.getElementById("blackList");
// get html form used to add sites to blacklist
let form = document.getElementById("form");
// get html button used to turn on/off autoClose function
let toggleButton = document.getElementById("toggleButton");
// get clear button (used to clear the whole blackList)
let clear = document.getElementById("clear");

// add event listener on new submited site
form.addEventListener("submit", addSite);
// on toggle button click, toggle the autoClose option
toggleButton.addEventListener("click", toggle);
// on clear button click, clear the blackList
clear.addEventListener("click", clearBLackList);

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

 /**
       *function addSite gets URL value from html form user wishes to blacklist
       */
function addSite() {
  // get  value from form input
  let domain = document.querySelector('input[name="url"]').value;
  // declare variable for blackListed sites -> global scope variable
  let blackListedSites;
  // get blackListed sites from browser storage
  let blackList = browser.storage.local.get("blackList");
  blackList.then((res) => {
    // check if there are any blacklisted sites
    if (!res.blackList) {
      blackListedSites = [];
      // parse blackListed sites to object
    } else {
      blackListedSites = JSON.parse(res.blackList);
    }

    // parse full url to domain adress only
    let regDom = domain
      .replace("http://", "")
      .replace("https://", "")
      .replace("www.", "")
      .split(/[/?#]/)[0];

      //check if site, user wishes to block is not already blocked
    for (let i = 0; i < blackListedSites.length; i++) {
      if (
        blackListedSites[i]["domain"] == domain ||
        blackListedSites[i]["regex"] == regDom
      ) {
        //log if so
        //TODO create some sort of flash message to popup and options page
        console.log("this site is already being blocked");
        return;
      }
    }

    // create object made of full URL and parsed URL
    const object = {
      domain: domain,
      regex: regDom,
    };

    // push the previous object to the existing blacklist
    blackListedSites.push(object);

    // parse blackList object to String, so we can save it to the browser storage
    let parsed = JSON.stringify(blackListedSites);
    // log parsed blacklist
    console.log(parsed);

    // save blackListed sites to the browser storage
    browser.storage.local.set({
      blackList: parsed,
    });

    //log if succesfully accomplished
    //TODO create some sort of flash message to popup and options page
    console.log("succesfully added domain to the blacklist");
  });
}

 /**
       *function toggle is triggered when toggle html button is used
       */
function toggle() {
  console.log("toggle");
  // get autoclose and its values from browser storage
  let autoClose = browser.storage.local.get("autoClose");
  autoClose.then((res) => {
    // set the setting to the html value
    let settings = browser.storage.local.set({
      autoClose: toggleButton.checked,
    });
    //after setting are saved, update the html button's value to the set one 
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

      /*
          browser.browserAction.setIcon({
              path: "icon/enabled.png"
          });
          */
      //otherwise set it enable it
    } else {
      toggleButton.checked = true;

      /*
          browser.browserAction.setIcon({
              path: "icon/disabled.png"
          });
          */
    }
  });
}

/**
       *function clearBlacklist clear the whole URL UblackList
       */

      function clearBLackList() {
        let empty = [];
        let parsed = JSON.stringify(empty);
        browser.storage.local.set({
          blackList: parsed,
        });
        console.log("successfully cleared BlackList");
        blackListdiv.innerText = "";
      }

updateButton();
showBlacklistedSites();
