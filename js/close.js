
 /**
       *onReq function retrieves current url, parses it, so we can compare it to the blacklisted ones
        then we compare each blacklisted url to the current one and close the tab, if it's blacklisted
       *
       * @param {object} takes info about site we are about to access
       * 
       */

function onReq(req) {
  // get autoclose function settings from browser storage
  browser.storage.local.get("autoClose").then((res) => {
    // if autoClose is enabled by the user continue, else stop
    if (res.autoClose == true) {
      // get array of blacklisted sites
      browser.storage.local.get("blackList").then((res) => {
        // if blacklist exists
        if (res.blackList) {
          // parse blacklist to object
          const blackList = JSON.parse(res.blackList);

          // parse request url to a comparable one
          let url = req.url
            .replace("http://", "")
            .replace("https://", "")
            .replace("www.", "")
            .split(/[/?#]/)[0];

          let domain = req.url
            .replace("http://", "")
            .replace("https://", "")
            .replace("www.", "");

          // compare each blacklisted sites to the one being accessed
          blackList.forEach((site) => {
            // compare blacklisted site to the one being accessed
            if (
              url.toLowerCase() == site.regex ||
              domain.toLowerCase() == site.regex
              // if accesed site is blacklisted, use close function to close it
            ) {
              return closeTab(req.tabId);
            }
          });
          // return if there's no blacklist
        }
        return;
      });
      // return if autoClose is not enabled
    }
    return;
  });
}

 /**
       *
       * @param {string} takes Id of the tab, we want to close
       * 
       */
function closeTab(tabId) {
  // destroy specified browser tab
  browser.tabs.remove(tabId);
}

// before browser navigates to a site, check if it is not blacklisted
browser.webNavigation.onBeforeNavigate.addListener(onReq);
