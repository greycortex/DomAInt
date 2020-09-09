// if user did not turn autoClose off, it has to be turned on automatically for the first time
browser.storage.local.get("autoClose").then((res) => {
  if (!res.autoClose || res.autoClose != false) {
    browser.storage.local.set({
      autoClose: false,
    });
  }
});

// if autoClose function is turned on
// onReq function gets current url, parses it, so we can compare it to the blacklisted ones
// then we compare each blacklisted url to the current one and close the tab, if it's blacklisted
function onReq(req) {
  browser.storage.local.get("autoClose").then((res) => {
    if (res.autoClose == true) {
      browser.storage.local.get("blackList").then((res) => {
        if (res.blackList) {
          const blackList = JSON.parse(res.blackList);

          let url = req.url
            .replace("http://", "")
            .replace("https://", "")
            .replace("www.", "")
            .split(/[/?#]/)[0];
          let domain = req.url
            .replace("http://", "")
            .replace("https://", "")
            .replace("www.", "");

          blackList.forEach((site) => {
            console.log(site);
            if (
              url.toLowerCase() == site.regex ||
              domain.toLowerCase() == site.regex
            ) {
              return closeTab(req.tabId);
            }
          });
        }
        return;
      });
    }
    return;
  });
}

// this function closes a certain tab
function closeTab(tabId) {
  browser.tabs.remove(tabId);
}

browser.webNavigation.onBeforeNavigate.addListener(onReq);
