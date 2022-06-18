/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!************************!*\
  !*** ./src/content.js ***!
  \************************/
/*let ifrm = document.createElement('iframe');
ifrm.setAttribute('id', 'ifrm'); // assign an id
ifrm.setAttribute('src', 'afterClosePopup.html');
document.body.appendChild(ifrm);
*/

 /**
       * showPopup function creates an iframe html element and inserts the actual html popup
       * from web accessible resources in it
       */


function showPopup() {
  // Avoid recursive frame insertion...
  let extensionOrigin = "chrome-extension://" + chrome.runtime.id;
    let iframe = document.createElement("iframe");
    // Must be declared at web_accessible_resources in manifest.json
    iframe.src = chrome.runtime.getURL("/assets/html/afterClosePopup.html");
    iframe.setAttribute("id", "iframe");
    document.body.appendChild(iframe);

    // iframe styling
    iframe.style.cssText =
      "position:fixed;top:15px;right:15px;display:block;" +
      "width:300px;height:170px;z-index:9999;" +
      "border-radius:10px;";

    // remove popup automatically after 15 seconds
    
      setTimeout(() => {
        removePopup();
      }, 15000)
      
}

/**
       * function removePopup gets the iframe element by its id and then removes it
       */

function removePopup() {
  let popup = document.getElementById("iframe");
  if(popup){
  document.body.removeChild(popup);
  }
}

/**
       * On message listener that listens for show popup message, send whenever a site is closed by autoclose
       * calls the show popup function and then sends response back
       *  @param {object} request = used to check for the show popup message
       * @param {function} sendResponse used for callback
       * @returns {Promise} Response message
       */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.data === "show_popup") {
        showPopup();
  }
  return Promise.resolve(request.closedUrl);
});

/**
       * On message listener that listens for remove popup message, this message is send with the cross button on the iframe
       * calls the removePopup function and then sends response back
       * @param {object} request = used to check for the remove popup message
       * @param {function} sendResponse used for callback
       * @returns {Promise} Response message
       */

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === "remove_popup") {
        removePopup();
     
  }
  return Promise.resolve(request.closedUrl);
});

/******/ })()
;
//# sourceMappingURL=content.js.map