const fs = require('fs');
const path = require('path');

fs.readFile(path.resolve(__dirname, '../dist/background.js'), 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  const result = data.replace('var global = (0, eval)("this")', 'var global = (function(g){ return g;}(this))');

  fs.writeFile(path.resolve(__dirname, '../dist/background.js'), result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
});