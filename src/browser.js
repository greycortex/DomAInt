

/**
 * Returns true for HTTPS.
 * 
 * @param {String} url
 * @returns {Boolean}
 */
function getSecure(url) {
    if (url.startsWith("https://")) {
        return true;
    }
    
    return false;
}

/**
 * Returns hostname, eg. "greycortex.com".
 * 
 * @param {type} url
 * @returns {String}
 */
function getHostName(url) {
    return url.match(/:\/\/(.[^/]+)/)[1];
}


/**
 * This is to close the browser tab.
 * 
 * @param {type} tabId
 * @returns {undefined}
 */
function CloseTab(tabId) {
    var delayEnabledItem = chrome.storage.local.get(["closeDelayEnabled", "closeDelayTime"]);
    delayEnabledItem.then((res) => {
        if (res.closeDelayEnabled && res.closeDelayTime != null) {
            console.log(tabId);
            console.log(res.closeDelayTime);
            setTimeout(chrome.tabs.remove, res.closeDelayTime, tabId);
        } else {
            chrome.tabs.remove(tabId);
        }
    });
}


function handleUpdated(tabId, changeInfo, tabInfo)
{
	var gettingEnabled = chrome.storage.local.get('autoCloseEnabled');
        
        
        
	gettingEnabled.then((isEnabled) =>
	{
		if (!isEnabled.autoCloseEnabled) {
			return;
		}
		var gettingItem = chrome.storage.local.get('blacklistSitesAutoClose');
		gettingItem.then((res) =>
		{
			if (!res.blacklistSitesAutoClose)
			{
				return;
			}
			var parsed = JSON.parse(res.blacklistSitesAutoClose);
			for (var i = 0; i < parsed.length; i++)
			{
				if (parsed[i].regexSearch)
				{
					if ((new RegExp(parsed[i].url, "i")).test(changeInfo.url))
					{
						CloseTab(tabId);
					}
				}
				else
				{
					var regString = RegExp.escape(parsed[i].url).replace(/\\\*/g, ".*");
					regString = "^".concat(regString).concat("$");
					if ((new RegExp(regString, "i")).test(changeInfo.url))
					{
						CloseTab(tabId);
					}
				}
			}
		});
	});
}

/**
 * Main for browsers...
 */
// browser.tabs.onUpdated.addListener(handleUpdated);

//  window.location.hostname.split(".");