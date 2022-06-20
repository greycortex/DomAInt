
/**
*  gets the url of currently opened tab
* @returns {Promise} returns url of current page using Promise
*/

export function getCurrentURL() {
	let currentTab;
	// returns promise, so we can await the value
	return new Promise((resolve, reject) => {
		try {
			//query current browser tab
			chrome.tabs
				.query({ currentWindow: true, active: true })
				//after we get info about current tab, resolve it's URL adress
				.then((tabs) => {
					currentTab = tabs[0].url;

					if (currentTab.startsWith("http")) {
						resolve(currentTab);
					} else {
						resetIcon();
					}
				});
		} catch (err) {
			console.log(err);
			reject(new Error(err));
		}
	});
}

/**
* showAfterClosePopup is used to send message to content script to inject iframe of our popup to the new tab
* and is fired whenever a blacklisted site is closed
*  
* gets id of the new tab (neede to send a message), then sends the message
*/

export function showAfterClosePopup() {
	let currentDomain = chrome.tabs.query({
		currentWindow: true,
		active: true,
	});
	currentDomain.then((tab) => {
		const currentTabId = tab[0].id;
		console.log(`curr tab ${currentTabId}`);
		chrome.tabs.sendMessage(currentTabId, { data: "show_popup" }).then((response => {
			console.log(`response from showAfterClosePopup message: ${response}`);
		}));
	});
}

/**
* getCurrentTab (will replace repeating code, callback will be changed to promise)
* used to get id of the active (current) tab
*
* @param {callback} defined to return callback for now
* @returns {callback} callbacks the active tab object
*/

export function getCurrentTab(callback) {
	let currTab;
	let currentDomain = chrome.tabs.query({
		currentWindow: true,
		active: true,
	});
	currentDomain.then((tab) => {
		currTab = tab[0];
		callback(currTab);
	});
}

/**
 * basically just closes the tab with specified id
 *
 * @param {string} id of the tab we wish to close
 * @returns {function} calls the browser api to close the tab
 */

export function closeTab(tabId) {
	return new Promise((resolve, reject) => {
		chrome.tabs.remove(tabId, tab => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError));
			} else {
				resolve(tab);
			}
		})
	})
}

/**
 * changes icons according to Keras model result
 *
 * @param {Number} takes Keras model result -> 0.9485247731208801
 */

 export function changeIcon(modelResult) {
	let greenThreshold = 0.2;
	let orangeThreshold = 0.6;
	let redThreshold = 0.9;
    
	let threshold = chrome.storage.local.get("threshold");
	threshold.then((res) => {
	    // if theres no site being blacklisted
	    if (res.threshold != null && res.threshold.length > 0) {
		let threshold = JSON.parse(res.threshold);
		greenThreshold = (threshold.green == 0) ? 0 : threshold.green / 100;
		orangeThreshold = threshold.orange / 100;
		redThreshold = threshold.red / 100;
	    }
    
	    // TODO: comment this!
	    console.log(greenThreshold, orangeThreshold, redThreshold);
    
	    // if result is less then 0.2 or settings
	    //@TODO: browserAction is deprecated in manifest V3
	    if (modelResult >= 0 && modelResult <= greenThreshold) {
		chrome.action.setTitle({ title: "This page seems to be safe!" });
		// set extension icon to green
		chrome.action.setIcon({
		    path: "/assets/img/green.png",
		});
    
		// if result is between green and orande, it is the grey area
	    } else if (modelResult > greenThreshold && modelResult < orangeThreshold) {
		chrome.action.setTitle({
		    title: "This is the grey area, we can't say much more.",
		});
		// set extension icon to orange
		chrome.action.setIcon({
		    path: "/assets/img/grey.png",
		});
    
		// if result is below red, it is orange
	    } else if (modelResult >= orangeThreshold && modelResult < redThreshold) {
		chrome.action.setTitle({
		    title: "This page might not be all safe.",
		});
		// set extension icon to orange
		chrome.action.setIcon({
		    path: "/assets/img/orange.png",
		});
    
		// if result is bigger than red it is dangerous
	    } else if (modelResult >= redThreshold && modelResult <= 1.0) {
		chrome.action.setBadgeBackgroundColor({ color: "red" });
		chrome.action.setTitle({
		    title: "Warning: this page might be dangerous!",
		});
		// set extension icon to red
		chrome.action.setIcon({
		    path: "/assets/img/red.png",
		});
		// whatever may (have) happened
	    } else {
		chrome.action.setTitle({ title: "DomAIn by GreyCortex" });
		// if model didnt predict or an error has occured, set grey
		chrome.action.setIcon({
		    path: "/assets/img/base.png",
		});
	    }
	});
    }
    
    /*
     function resetIcon resets icon, when on a page, that is not supposed to be tested 
     */
   export function resetIcon() {
	// set popup icon title to the base one
	chrome.action.setTitle({ title: "DomAIn by GreyCortex" });
	// change icon to the base one
	chrome.action.setIcon({
	    path: "/assets/img/base.png",
	});
    }