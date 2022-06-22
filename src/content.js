/*let ifrm = document.createElement('iframe');
ifrm.setAttribute('id', 'ifrm'); // assign an id
ifrm.setAttribute('src', 'afterClosePopup.html');
document.body.appendChild(ifrm);
*/


/**
* creates and injects an iframe of afterClosePopup
*
* @returns {void}
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
* removes injected iframe element
*
* @returns {void}
*/

function removePopup() {
  let popup = document.getElementById("iframe");
  if(popup){
  document.body.removeChild(popup);
  }
}

/**
* Listen for "show_popup" message, call showPopup function of received
*
* @listens runtime.onMessage listens for "show_popup" message
* @returns {Promise} resolves the url of closed site 
*/

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.data === "show_popup") {
        showPopup();
        //FIXME: returning null
        return sendResponse(request.closedUrl);
  }
  //return Promise.resolve(request.closedUrl);
});

/**
* Listen for "remove_popup" message, call removePopup function of received
*
* @listens runtime.onMessage listens for "remove_popup" message 
* @returns {Promise} resolves the url of closed site
*/

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === "remove_popup") {
        removePopup();
     
  }
  return Promise.resolve(request.closedUrl);
});
