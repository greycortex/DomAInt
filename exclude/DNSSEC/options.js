function saveOptions(e) {
  e.preventDefault();

  browser.storage.local.set({
    service: document.querySelector("[name=service]:checked").value
  });
}

function restoreOptions() {

  function setCurrentChoice(config) {
    if (config.service === undefined) {
      document.querySelector("[name=service][value=cloudflare]").checked = true;
    }

    document.querySelector("[name=service][value=" + config.service + "]").checked = true;
  }

  function onError(error) {
    console.log('ERROR: could not retrieve saved setting.');
  }

  var config = browser.storage.local.get('service');

  config.then(setCurrentChoice, onError);

}

document.addEventListener('DOMContentLoaded', restoreOptions);

document.querySelector('form').addEventListener('submit', saveOptions);
