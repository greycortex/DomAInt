
/**
*  gets the url of currently opened tab
* @returns {Promise} returns url of current page using Promise
*/

//TODO: check if works properly after change
export function getCurrentURL() {
	let currentTab;
	// returns promise, so we can await the value
	return new Promise((resolve, reject) => {
		//query current browser tab
		chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			}
			//after we get info about current tab, resolve it's URL adress
			currentTab = tabs[0].url;
			if (currentTab.startsWith("http")) {
				resolve(currentTab);
			} else {
				resetIcon();
			}
		});
	});
}

/**
* showAfterClosePopup is used to send message to content script to inject iframe of our popup to the new tab
* and is fired whenever a blacklisted site is closed
*  
* gets id of the new tab (neede to send a message), then sends the message
*/

export function showAfterClosePopup() {
	chrome.tabs.query({
		currentWindow: true,
		active: true,
	}, tab => {
		const currentTabId = tab[0].id;
		console.log(`curr tab ${currentTabId}`);
		chrome.tabs.sendMessage(currentTabId, { data: "show_popup" }, response => {
			console.log(`response from showAfterClosePopup message: ${response}`);
		});
	});
}

/**
* getCurrentTab (will replace repeating code, callback will be changed to promise)
* used to get id of the active (current) tab
*
* @param {callback} defined to return callback for now
* @returns {callback} callbacks the active tab object

export function getCurrentTab(callback) {
	chrome.tabs.query({
		currentWindow: true,
		active: true,
	}, tab => {
		const currTab = tab[0];
		callback(currTab);
	});
}
*/

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
			setIcon({ title: "This page seems to be safe!", iconPath: "/assets/img/green.png" });

		} else if (modelResult > greenThreshold && modelResult < orangeThreshold) {
			setIcon({ title: "This is the grey area, we can't say much more.", iconPath: "/assets/img/gray.png" });

		} else if (modelResult >= orangeThreshold && modelResult < redThreshold) {
			setIcon({ title: "This page might not be safe.", iconPath: "/assets/img/orange.png" });

		} else if (modelResult >= redThreshold && modelResult <= 1.0) {
			chrome.action.setBadgeBackgroundColor({ color: "red" });
			setIcon({ title: "Warning: this page might be dangerous!", iconPath: "/assets/img/red.png" });
		} else {

			resetIcon();
		}
	});
}

/**
 * 
 function resetIcon resets icon, when on a page, that is not supposed to be tested 
 */

export function resetIcon() {
	setIcon({ title: "DomAIn by GreyCortex", iconPath: "/assets/img/base.png" });
}

/**
 * changes extension icon, title according
 *
 * @param {Object} params parameters to be set
 * @param {String} params.title title to be set
 * @param {String} params.iconPath icon to be set
 */

export function setIcon(params) {
	// set popup icon title to the base one
	chrome.action.setTitle({ title: params.title });
	// change icon to the base one
	chrome.action.setIcon({
		path: params.iconPath,
	});
}