var path = require('path')
var read = require('./read')
var stringToBase64String = require('./stringToBase64String')
var replaceAll = require('./replaceAll')

var rubyCode = read(path.join(__dirname, '/templates/scopeImport.rb'))

function getRubyCodeWithData (data) {
  return replaceAll({
    string: rubyCode,
    target: '__DATA__',
    replacement: stringToBase64String(JSON.stringify(data))
  })
}

module.exports = getRubyCodeWithData
