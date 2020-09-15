// getting DOM elements from popup.html
let toggleButton = document.getElementById("toggleButton");
let cDomain = document.getElementById("cDomain");
let options = document.getElementById("options");
let clear = document.getElementById("clear");

// adding listeners to DOM elements
toggleButton.addEventListener("click", toggle);
cDomain.addEventListener("click", addCurrent);
options.addEventListener("click", openOptions);
clear.addEventListener("click", clearBLackList);

function openOptions() {
  browser.runtime.openOptionsPage();
}

function clearBLackList() {
  let empty = [];
  let parsed = JSON.stringify(empty);
  browser.storage.local.set({
    blackList: parsed,
  });
}

// toggle function is responsible for turning off/on blacklist site autoclose
// and saving the value to the local storage
function toggle() {
  console.log("toggle");
  let autoClose = browser.storage.local.get("autoClose");
  autoClose.then((res) => {
    let settings = browser.storage.local.set({
      autoClose: toggleButton.checked,
    });
    settings.then(function () {
      updateButton();
    });
  });
}

// if user clicks add current domain to blacklist on popup.html, this function is called
// this function parses url to regex used while comparing current url to the blacklisted ones
function addCurrent() {
  let domList = browser.storage.local.get("blackList");
  domList.then((res) => {
    let domainList;

    //create or get list of blacklisted sites
    if (!res.blackList) {
      domainList = [];
    } else {
      console.log(res.blackList);
      domainList = JSON.parse(res.blackList);
    }

    // get current url
    let currentDomain = browser.tabs.query({
      currentWindow: true,
      active: true,
    });
    currentDomain.then((tab) => {
      const domain = tab[0].url;

      // use regex to parse the url, so we can use it for comparing
      let regDom = domain
        .replace("http://", "")
        .replace("https://", "")
        .replace("www.", "")
        .split(/[/?#]/)[0];

      for (let i = 0; i < domainList.length; i++) {
        if (domainList[i]["domain"] == domain || domainList[i]["regex"] == regDom) {
          console.log("this site is already being blocked");
          return;
        }
      }
      console.log(domain);
      console.log(regDom);

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
    });
  });
}

// function update button is called to display current value (is autoclose turned on/off) and shows certain icon
function updateButton() {
  let buttonVal = browser.storage.local.get("autoClose");

  buttonVal.then((val) => {
    if (!val.autoClose || val.autoClose == null) {
      toggleButton.checked = false;

      /*
            browser.browserAction.setIcon({
                path: "icon/enabled.png"
            });
            */
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

updateButton();
