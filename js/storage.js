/**
 * function loadJSON loads JSON files from a specified path
 *
 * @param {string} file --> path to JSON file we want to load
 * @param {function} callback --> used to callback (return) loaded JSON file
 * @returns {Promise} returns loaded JSON using callback
 */
function loadJSON(file) {
  return new Promise(function (resolve, reject) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", file, true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      resolve(xobj.responseText);
    }
  };
  xobj.send(null);
});
}
