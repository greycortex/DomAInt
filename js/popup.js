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
let statusDiv = document.getElementById("statusDiv");

let navbar = document.getElementById("navbar");
let classToggler = document.getElementById("classToggler");

classToggler.addEventListener("click", () => {
  navbar.classList.toggle("navbar-change");

  classToggler.classList.toggle('up');
  classToggler.classList.toggle('up-scroll');
  classToggler.classList.toggle('down');
  
  virustotalDiv.classList.toggle('virustotalDivScroll');
});






//  will listen for popup open and then send request to the virustotal api with the current url if possible

document.addEventListener('DOMContentLoaded', function () {
  // only get domain, not full url
  let currentDomain = browser.tabs.query({
    currentWindow: true,
    active: true,
  });
  currentDomain.then((tab) => {
    postVirustotalAPIRequest(tab[0].url);
    console.log(tab[0].url);
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
       * @param {string} url - url that is going to be POSTed to the API
       * @returns {function call} calls function which retrieves the scan result
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
          .then((data) => {
            console.log(url);
            if(data){
            getVirustotalAPIResults(data.data.id, X_APIKey, url)
          }
          });
      }
     
      /**
       * Returns JSON result of a previous url scan
       *
       * @param {string} id - this id corresponds to the scan we POSTed and want to retrieve the results of
       * @param {string} X_APIKey - virustotal API auth API key
       * @param {string} url - url that was POSTed to the API
       * 
       * @returns {function call} returns json scan result of the url posted
       */
      
      function getVirustotalAPIResults(id, X_APIKey, url) {   
        console.log(url)
        console.log(`id ${id}`);
          fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, {
              headers: {
                  "X-Apikey":`${X_APIKey}`
                },
              method: "GET"
            })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              showVirutstotalAPIResults(data, url, id)
            }); 
      }

      /**
       * Parses Virustotal API results and calls addClass function depending on the result
       *
       * @param {string} takes an id from the previous function. That id corresponds with the final json result
       * @param {string} url - examined url, used to display it in the popup
       * 
       * @returns {function call} calls addClass function 
       */

      function showVirutstotalAPIResults(data, url, id) {
        let stats = data.data.attributes.stats;
        console.log(stats);

        let antiVirusCount = +stats.harmless + +stats.malicious + +stats.suspicious;
        console.log(antiVirusCount);
/*
        if(antiVirusCount == 0) {
          virustotalDiv.innerHTML = "failed to fetch";
        }
*/
        if(stats.harmless > stats.malicious && stats.harmless > stats.suspicious) {
          let percent = Math.round(stats.harmless/antiVirusCount*100);
          //virustotalDiv.innerHTML = `Virustotal url scan: <br> ${stats.harmless} out of ${antiVirusCount} consider ${url} <br> harmless`;
          virustotalDiv.innerHTML = `<h1>${percent}%</h1>`
          statusDiv.innerHTML = "<h5>harmless</h5>";
          return addClass("green");
        }
        
        else if(stats.suspicious > stats.harmless && stats.suspicious > stats.malicious) {
          let percent = Math.round(stats.suspicious/antiVirusCount*100);
          //virustotalDiv.innerHTML = `<br> ${stats.suspicious} out of ${antiVirusCount} consider ${url} suspicious`;
          virustotalDiv.innerHTML = `<h1>${percent}%</h1>`
          return addClass("Yellow");
        }

        else if(stats.malicious > stats.harmless && stats.malicious > stats.suspicious) {
          let percent = Math.round(stats.malicious/antiVirusCount*100);
          //virustotalDiv.innerHTML = `<br> ${stats.malicious} out of ${antiVirusCount} consider ${url} malicious`;
          virustotalDiv.innerHTML = `<h1>${percent}%</h1>`
          return addClass("Red");
        }
      }

       /**
       * 
       *  Adds predefined CSS class to fillbox element in order to trigger water like animation
       *  to display virustotal result percentage
       * 
       */

      function addClass(color) {
        let fillBox = document.getElementById("fillBox");

        switch(color) {
          case "green":
            fillBox.classList.add("fillBoxGreen"); 
            break;
          case "orange":
            fillBox.classList.add("fillBoxOrange"); 
            break;
          case "red":
            fillBox.classList.add("fillBoxRed"); 
            break;
        }
      }
 


