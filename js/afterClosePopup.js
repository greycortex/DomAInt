let whitelistButton = document.getElementById("whitelistButton");
let continueOnceButton = document.getElementById("continueOnceButton");
let crossButton = document.getElementById("domaintCross");
      
crossButton.addEventListener("click", removePopupMessage);
continueOnceButton.addEventListener("click", continueToSiteOnce);
whitelistButton.addEventListener("click", whitelistMessage);



function removePopupMessage() {
    let currentDomain = browser.tabs.query({
        currentWindow: true,
        active: true,
      });
      currentDomain.then((tab) => {
       let currTab = tab[0].id;
      
    browser.tabs.sendMessage(currTab, {msg: "remove_popup"}).then((response => {
        console.log(response);
      }));
    });
}

function whitelistMessage() {
    browser.runtime.sendMessage({
        msg: "send_url"
    }).then((response) => {
        console.log(response);
        addToWhiteList(response);
    });
    
}

function continueToSiteOnce() {
    browser.runtime.sendMessage({
        msg: "continue_once"
    }).then((response) => {
        console.log(response);
    });
}