'use strict';
const debug = require('debug'),
  resolve = require('./name-resolver'),
  assert = require('assert');

module.exports = name => {
  assert.ok(name, 'Name must be provided');
  const logKey = resolve(name);
  return new DebugLogger(logKey);
};

class DebugLogger {
  constructor(name) {
    this.debug = debug(name);
  }

  info() {
    this.debug.apply(this.debug, Array.from(arguments));
  }

  error() {
    this.debug.apply(this.debug, Array.from(arguments));
  }
}