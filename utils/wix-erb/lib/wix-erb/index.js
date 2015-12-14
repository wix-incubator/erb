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
  var options = {};

  options.template = opts.template;

  options.timeout = opts.timeout === undefined ? 1000 : opts.timeout;

  options.data = opts.data === undefined ? {
    values: {},
    functions: {}
  } : {
    values: opts.data.values === undefined ? {} : opts.data.values,
    functions: opts.data.functions === undefined ? {} : opts.data.functions
  };

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
