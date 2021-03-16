// getting DOM elements from popup.html

// get cDomain button (used to add current site to the blacklist)
let currentToBlacklist = document.getElementById("cDomain");
// get whitelist button (used to add current site to the whitelist)
let currentToWhitelist = document.getElementById("whitelist");
// get options button (used to open extension's options page on a new tab)
let options = document.getElementById("options");
// get cDomain button (used to add current site to the blacklist)
let cDomain = document.getElementById("cDomain");

let virustotalDiv = document.getElementById("virustotalDiv");





//  will listen for popup open and then send request to the virustotal api with the current url if possible

document.addEventListener('DOMContentLoaded', function () {
  let currentDomain = browser.tabs.query({
    currentWindow: true,
    active: true,
  });
  currentDomain.then((tab) => {
    const domain = tab[0].url;
  postVirustotalAPIRequest(domain);;
  });
});



// adding listeners to DOM elements triggering their responsible functions
currentToBlacklist.addEventListener("click", addCurrent);
currentToWhitelist.addEventListener("click", function() {
  // get current url
  let currentDomain = browser.tabs.query({
    currentWindow: true,
    active: true,
  });
  currentDomain.then((tab) => {
    const domain = tab[0].url;
    addToWhiteList(domain);
  });
});
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
        console.log("List could not be retrieved");
        return;
      }
    });
      }
    });
}

function getApiKey() {
    return new Promise(function(resolve, reject) {
      let getKey = browser.storage.local.get("apikey");
          getKey.then((res) => {
      if(res.apikey) {
        resolve(res.apikey);
      } else {
        reject(new Error("There is no ApiKey set in the storage"));
      }
    });
  });
}

/**
       * Returns getVirusTotalAPIResults function call = we firstly need to post the url to examine
       * the api then returns an id, where we get the final result using GET request
       *
       * @param {string} takes an url that should be examined by virustotal
       * @returns {function} calls function which retrieves the scan result
       */

       
      async function postVirustotalAPIRequest(url) {
        let X_APIKey = await getApiKey(); 
        X_APIKey = X_APIKey.replaceAll('"', "");
        
        const body = new FormData();
        body.append("url", url);
      
        const data = new URLSearchParams();
        for (const pair of body) {
          data.append(pair[0], pair[1]);
        }
      
        fetch("https://www.virustotal.com/api/v3/urls", {
          body: data,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Apikey":X_APIKey
          },
          method: "POST"
        })
          .then((response) => response.json())
          .then((data) => getVirustotalAPIResults(data.data.id, X_APIKey, url));
          
          
          
      }
     
      /**
       * Returns JSON result of a previous url scan
       *
       * @param {string} takes an id from the previous function. That id corresponds with the final json result
       * 
       * @returns {JSON} returns json scan result of the url posted
       */
      
      function getVirustotalAPIResults(id, X_APIKey, url) {
      
          fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, {
              headers: {
                  "X-Apikey":`${X_APIKey}`
                },
              method: "GET"
            })
            .then((response) => response.json())
            .then((data) => showVirutstotalAPIResults(data, url));
      
      }

      function showVirutstotalAPIResults(data, url) {
        let stats = data.data.attributes.stats;

        let antiVirusCount = +stats.harmless + +stats.malicious + +stats.suspicious;
        console.log(`${+stats.harmless} ${+stats.malicious} ${+stats.suspicious}`);

        virustotalDiv.innerHTML = `Virustotal url scan: <br> ${stats.harmless} out of ${antiVirusCount} consider ${url} <br> harmless`;
        
        if(stats.malicious > 0) {
          virustotalDiv.innerHTML += `<br> ${stats.malicious} out of ${antiVirusCount} consider ${url} malicious`;
        }

        if(stats.suspicious > 0) {
          virustotalDiv.innerHTML += `<br> ${stats.suspicious} out of ${antiVirusCount} consider ${url} suspicious`;
        }
      }
 


