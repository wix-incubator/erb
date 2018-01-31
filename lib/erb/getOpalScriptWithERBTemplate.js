var Promise = require('bluebird')
var path = require('path')
var read = require('./read')
var replaceAll = require('./replaceAll')
var stringToBase64String = require('./stringToBase64String')

var opalScript = replaceAll({
  string: read(path.join(__dirname, 'templates/runOpal.js')),
  target: '__OPAL__',
  replacement: Promise
    .resolve([
      '../../ruby/opal.js',
      '../../ruby/opal-compiler.js',
      '../../ruby/opal-erb.js',
      '../../ruby/json.js',
      '../../ruby/base64.js',
      '../../ruby/template.js'
    ])
    .map(function (file) {
      return path.join(__dirname, file)
    })
    .map(read)
    .call('join', '\n')
})

function getOpalScriptWithERBTemplate (erbTemplate, fields) {
  return replaceAll({
    string: replaceAll({
      string: opalScript,
      target: '__FIELDS__',
      replacement: stringToBase64String(JSON.stringify(fields))
    }),
    target: '__TEMPLATE__',
    replacement: stringToBase64String(erbTemplate)
  })
}

module.exports = getOpalScriptWithERBTemplate
