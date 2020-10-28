/**
       *onReq function retrieves current url, parses it, so we can compare it to the blacklisted ones
        then we compare each blacklisted url to the current one and close the tab, if it's blacklisted
       *
       * @param {object} takes info about site we are about to access
       * 
       */

/**
 *
 * @param {string} takes Id of the tab, we want to close
 *
 */
function closeTab(tabId) {
  // destroy specified browser tab
  browser.tabs.remove(tabId);
}

