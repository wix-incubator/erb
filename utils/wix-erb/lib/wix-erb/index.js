'use strict';

var Promise = require('bluebird');
var validateData = require('./validateData');
var getOpalScriptWithERBTemplate = require('./getOpalScriptWithERBTemplate');
var getRubyCodeWithData = require('./getRubyCodeWithData');
var runOpalScript = require('./runOpalScript');

function validateTemplate(template) {
  if (typeof template !== 'string') {
    throw new Error('template must be a string');
  }
}

function getNormalizedOptions(opts) {
  var options = JSON.parse(JSON.stringify(opts));

  options.timeout = opts.timeout === undefined ? 5000 : opts.timeout;

  if (options.data === undefined) {
    options.data = {
      values: {},
      functions: {}
    };
  }
  if (options.data.values === undefined) {
    options.data.values = {};
  }
  if (options.data.functions === undefined) {
    options.data.functions = {};
  }

  return options;
}

function erb(opts) {
  var options = getNormalizedOptions(opts);
  return Promise
    .try(function () {
      validateTemplate(options.template);
      validateData(options.data);
      return getRubyCodeWithData(options.data);
    })
    .then(function (rubyCode) {
      return getOpalScriptWithERBTemplate('<%\n' + rubyCode + '\n%>' + options.template);
    })
    .then(runOpalScript.bind(null, options.timeout));
}

module.exports = erb;
