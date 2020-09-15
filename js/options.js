let blackListdiv = document.getElementById("blackList");
let form = document.getElementById("form");
let toggleButton = document.getElementById("toggleButton");

form.addEventListener("submit", addSite);
toggleButton.addEventListener("click", toggle);

function showBlacklistedSites() {
  let blackList = browser.storage.local.get("blackList");
  blackList.then((res) => {
    if (!res.blackList || res.blackList.length < 1) {
      blackListdiv.innerText = "No blacklisted sites yet";
    } else {
      let blackListArray = JSON.parse(res.blackList);
      console.log(blackListArray);
      blackListArray.forEach((site) => {
        blackListdiv.innerHTML += `<b>domain:</b> ${site.domain} <br> <b>regex search:</b> ${site.regex} <br>`;
      });
    }
  });
}

function addSite() {
  let domain = document.querySelector('input[name="url"]').value;
  let blackListedSites;

  let blackList = browser.storage.local.get("blackList");
  blackList.then((res) => {
    if (!res.blackList) {
      blackListedSites = [];
    } else {
      blackListedSites = JSON.parse(res.blackList);
    }

    let regDom = domain
      .replace("http://", "")
      .replace("https://", "")
      .replace("www.", "")
      .split(/[/?#]/)[0];

    for (let i = 0; i < blackListedSites.length; i++) {
      if (
        blackListedSites[i]["domain"] == domain ||
        blackListedSites[i]["regex"] == regDom
      ) {
        console.log("this site is already being blocked");
        return;
      }
    }

    const object = {
      domain: domain,
      regex: regDom,
    };

    blackListedSites.push(object);

    let parsed = JSON.stringify(blackListedSites);
    console.log(parsed);

    browser.storage.local.set({
      blackList: parsed,
    });

    console.log("succesfully added domain to the blacklist");
  });
}

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
showBlacklistedSites();
