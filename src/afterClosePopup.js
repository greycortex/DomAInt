let whitelistButton = document.getElementById("whitelistButton");
let continueOnceButton = document.getElementById("continueOnceButton");
let crossButton = document.getElementById("domaintCross");
      
crossButton.addEventListener("click", removePopupMessage);
continueOnceButton.addEventListener("click", continueToSiteOnce);
whitelistButton.addEventListener("click", whitelistMessage);

/**
       * removePopupMessage is used to remove the iframe popup element from the page
       * and is fired when the cross button on it is clicked
       */

function removePopupMessage() {
    let currentDomain = chrome.tabs.query({
        currentWindow: true,
        active: true,
      });
      currentDomain.then((tab) => {
       let currTab = tab[0].id;
      
    chrome.tabs.sendMessage(currTab, {msg: "remove_popup"}).then((response => {
        console.log(response);
      }));
    });
}

/**
       * whiteListMessage is used to send message, which retrieves closed url as a response
       * and then adds it to the whitelist
       * @returns {function} addToWhiteList call
       */

function whitelistMessage() {
    chrome.runtime.sendMessage({
        msg: "send_url"
    }).then((response) => {
        console.log(response);
        return addToWhiteList(response);
    });
    
}

/**
       * ContinueToSiteOnce sends message to the backgrounds script to call the continueOnce function
       */

function continueToSiteOnce() {
    chrome.runtime.sendMessage({
        msg: "continue_once"
    }).then((response) => {
        console.log(response);
    });
}