var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))

function read (file) {
  return fs.readFileAsync(file).then(String)
}

module.exports = read
