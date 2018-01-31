var Promise = require('bluebird')
var validateData = require('./validateData')
var getOpalScriptWithERBTemplate = require('./getOpalScriptWithERBTemplate')
var getRubyCodeWithData = require('./getRubyCodeWithData')
var runOpalScript = require('./runOpalScript')

function validateTemplate (template) {
  if (typeof template !== 'string') {
    throw new Error('template must be a string')
  }
}

function getNormalizedOptions (opts) {
  var options = JSON.parse(JSON.stringify(opts))

  options.timeout = opts.timeout === undefined ? 5000 : opts.timeout

  if (options.data === undefined) {
    options.data = {}
  }
  if (options.data.values === undefined) {
    options.data.values = {}
  }
  if (options.data.functions === undefined) {
    options.data.functions = {}
  }
  if (options.data.fields === undefined) {
    options.data.fields = {}
  }

  return options
}

function earlyValidation (opts) {
  if (opts.data && typeof opts.data === 'object' && opts.data.fields && typeof opts.data.fields === 'object') {
    Object.keys(opts.data.fields).forEach(function (field) {
      if (opts.data.fields[field] === undefined) {
        throw new Error(field + ' field is undefined')
      }
      if (typeof opts.data.fields[field] === 'function') {
        throw new Error(field + ' field is a function')
      }
    })
  }
}

function erb (opts) {
  var options
  return Promise
    .try(function () {
      earlyValidation(opts)
      options = getNormalizedOptions(opts)
      validateTemplate(options.template)
      validateData(options.data)
      return getRubyCodeWithData(options.data)
    })
    .then(function (rubyCode) {
      return getOpalScriptWithERBTemplate('<%\n' + rubyCode + '\n%>' + options.template, options.data.fields)
    })
    .then(function (script) {
      return runOpalScript(options.timeout, script)
    })
}

module.exports = erb
