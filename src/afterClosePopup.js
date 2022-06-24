import { addToWhiteList } from "./mergedSettings";

let whitelistButton = document.getElementById("whitelistButton");
let continueOnceButton = document.getElementById("continueOnceButton");
let crossButton = document.getElementById("domaintCross");

crossButton.addEventListener("click", removePopupMessage);
continueOnceButton.addEventListener("click", continueToSiteOnce);
whitelistButton.addEventListener("click", whitelistMessage);


/**
* removes iframe injected into page, after a site from blacklist was autoclosed
*/

async function removePopupMessage() {
  let tab = await chrome.tabs.query({ currentWindow: true, active: true, });
  let currTab = tab[0].id;

  chrome.tabs.sendMessage(currTab, { msg: "remove_popup" }, response => {
    console.log(`response from message "remove_popup in afterClosePopupjs is: ${response}`);
  });
}

/**
* whiteListMessage is used to send message, which retrieves closed url as a response
* and then adds it to the whitelist
* @returns {void} adds closed site into whitelist
*/

function whitelistMessage() {
  chrome.runtime.sendMessage("send_url", (response) => {
    // 3. Got an asynchronous response with the data from the background
    console.log(`response for "send_url" message is: ${response}`);
    return addToWhiteList(response);
  });
}

/**
* ContinueToSiteOnce sends message to the backgrounds script to call the continueOnce function
* @returns {void}
*/

/*
function continueToSiteOnce() {
    chrome.runtime.sendMessage({
        msg: "continue_once"
    }).then((response) => {
        console.log(response);
    });
}
*/

function continueToSiteOnce() {
  chrome.runtime.sendMessage("continue_once", (response) => {
    // 3. Got an asynchronous response with the data from the background
    console.log(`response for "continue_once" message is: ${response}`);
  });
}
