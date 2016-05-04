'use strict';
const debug = require('debug'),
  resolve = require('./name-resolver');

const key = resolve(require('../package.json').name);

module.exports = () => new DebugLogger(key);

class DebugLogger {
  constructor(name) {
    this.err = debug(name);
    this.out = debug(name);
    this.out.log = console.log.bind(console);
  }

  info() {
    this.out.apply(this.out, Array.from(arguments));
  }

  error() {
    this.err.apply(this.err, Array.from(arguments));
  }
}