var Promise = require('bluebird')

function replaceAll (parameters) {
  return Promise
    .props(parameters)
    .then(function (parameters) {
      return parameters.string.split(parameters.target).join(parameters.replacement)
    })
}

module.exports = replaceAll
