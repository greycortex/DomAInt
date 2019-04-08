// Store active tab URL and scheme to pass to popup
var activeScheme = undefined;
var activeHost = undefined;

function schemeFromURL(url) {
  var scheme = 'http';
  if (url.substring(0, 8) == "https://") {
    scheme = 'https';
  }
}

function hostFromURL(url) {
  return url.match(/:\/\/(.[^/]+)/)[1];
}

function checkDNSSEC(details) {
  browser.pageAction.show(details.tabId);

  // Only consider requests for main web pages
  if (details.type != 'main_frame') return;

  var host = hostFromURL(details.url);
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {
    try { response = JSON.parse(xhr.responseText); }
    catch (SyntaxError) { return; }

    var icons = {};
    if (response['Status'] === 0 && response['AD'] === true) {
      browser.pageAction.setTitle({ tabId: details.tabId, title: 'DNSSEC validation succeeded' });
      browser.pageAction.setIcon({ tabId: details.tabId, path: 'button/dns-secure-64.png' });
      browser.pageAction.setPopup({ tabId: details.tabId, popup: 'popup/secure.html' });
    } else {
      browser.pageAction.setTitle({ tabId: details.tabId, title: 'DNSSEC validation failed' });
      browser.pageAction.setIcon({ tabId: details.tabId, path: 'button/dns-insecure-64.png' });
      browser.pageAction.setPopup({ tabId: details.tabId, popup: 'popup/insecure.html' });
    }

    // If the loaded tab is still the active one, update popup data
    browser.tabs.get(details.tabId, function(tab) {
      if (tab.active) {
        activeScheme = schemeFromURL(details.url);
        activeHost = host;
      }
    });
  };

  var url = null;

  var service = browser.storage.local.get('service');
  service.then(onService, onError);

  function onService(config) {
    var url = null;
    switch (config.service) {
      case 'cloudflare':
        url = 'https://cloudflare-dns.com/dns-query?ct=application/dns-json&type=A&name=' + host;
        break;
      case 'google':
        url = 'https://dns.google.com/resolve?name=' + host;
        break;
      default:
        url = 'https://cloudflare-dns.com/dns-query?ct=application/dns-json&type=A&name=' + host;
        break;
    }

    if (url != null) {
      xhr.open('GET', url, true)
      xhr.send();
    }
  }

  function onError(error) {
    console.log('ERROR: could not retrieve saved config.');
  }
}

// Check status on request
browser.webRequest.onCompleted.addListener(checkDNSSEC, { urls: ['<all_urls>'] });

// Change popup data on tab change
browser.tabs.onActivated.addListener(function(info) {
  browser.tabs.query({ active: true, lastFocusedWindow: true }).then(function(tab) {
    activeScheme = schemeFromURL(tab[0].url);
    activeHost = hostFromURL(tab[0].url);
  });
});

browser.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  browser.pageAction.show(details.tabId);
});

// Send the popup its data
browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  sendResponse({ scheme: activeScheme, domain: activeHost });
});
