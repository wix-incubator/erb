
var Promise = require('bluebird');
var read = require('./read');
var replaceAll = require('./replaceAll');
var stringToBase64String = require('./stringToBase64String');

var opalScript = replaceAll({
  string: read(__dirname + '/templates/runOpal.js'),
  target: '__OPAL__',
  replacement: Promise
    .map([
      __dirname + '/../../ruby/opal.js',
      __dirname + '/../../ruby/opal-compiler.js',
      __dirname + '/../../ruby/opal-erb.js',
      __dirname + '/../../ruby/json.js',
      __dirname + '/../../ruby/base64.js',
      __dirname + '/../../ruby/template.js'
    ], read)
    .call('join', '\n')
});

function getOpalScriptWithERBTemplate(erbTemplate) {
  return replaceAll({
    string: opalScript,
    target: '__TEMPLATE__',
    replacement: stringToBase64String(erbTemplate)
  });
}

module.exports = getOpalScriptWithERBTemplate;
