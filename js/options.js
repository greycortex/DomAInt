let blackListdiv = document.getElementById("blackList");
let form = document.getElementById("form");

form.addEventListener("submit", addSite);

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

showBlacklistedSites();
