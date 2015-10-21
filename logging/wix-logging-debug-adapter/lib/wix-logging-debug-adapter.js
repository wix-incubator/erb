'use strict';
const write = require('wix-logging-client').write,
  util = require('util');

exports.setup = debug => {
  let originalCoerce = debug.coerce;

  debug.coerce = val => {
    return val ? originalCoerce(val) : '';
  };

  debug.useColors = function () {
    return false;
  };

  debug.formatArgs = function () {
    return arguments;
  };

  debug.log = function () {
    write({
      timestamp: new Date().getTime(),
      level: 'debug',
      category: this.namespace,
      msg: util.format.apply(util, arguments)
    });
  };
};