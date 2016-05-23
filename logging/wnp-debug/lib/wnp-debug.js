'use strict';
const debug = require('debug'),
  resolve = require('./name-resolver'),
  assert = require('assert');

module.exports = name => {
  assert.ok(name, 'Name must be provided');
  const logKeys = resolve(name);
  return new DebugLogger(logKeys);
};

class DebugLogger {
  constructor(logKeys) {
    this.info = debug(logKeys['info']);
    this.debug = debug(logKeys['debug']);
    this.error = debug(logKeys['error']);
  }

  debug() {
    this.debug.apply(this.debug, Array.from(arguments));
  }

  info() {
    this.info.apply(this.info, Array.from(arguments));
  }

  error() {
    this.error.apply(this.error, Array.from(arguments));
  }
}