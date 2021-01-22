/*let ifrm = document.createElement('iframe');
ifrm.setAttribute('id', 'ifrm'); // assign an id
ifrm.setAttribute('src', 'afterClosePopup.html');
document.body.appendChild(ifrm);
*/

function showPopup() {
  // Avoid recursive frame insertion...
  let extensionOrigin = "chrome-extension://" + browser.runtime.id;
  if (!location.ancestorOrigins.contains(extensionOrigin)) {
    let iframe = document.createElement("iframe");
    // Must be declared at web_accessible_resources in manifest.json
    iframe.src = browser.runtime.getURL("afterClosePopup.html");
    iframe.setAttribute("id", "iframe");
    document.body.appendChild(iframe);
    

    // Some styles for a fancy sidebar
    iframe.style.cssText =
      "position:absolute;top:15px;right:15px;display:block;" +
      "width:300px;height:200px;z-index:9999;" +
      "border-radius:10px;";

      setTimeout(() => {
        removePopup();
      }, 15000)
  }
}

function removePopup() {
  let popup = document.getElementById("iframe");
  if(popup){
  document.body.removeChild(popup);
  }
}

// if sent tabid != currentid
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.data === "show_popup") {
        showPopup();
     
  }
  sendResponse(request.closedUrl);
});

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === "remove_popup") {
        removePopup();
     
  }
  sendResponse(request.closedUrl);
});
