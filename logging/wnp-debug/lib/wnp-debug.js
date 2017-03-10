const debug = require('debug'),
  resolve = require('./name-resolver'),
  assert = require('assert');

module.exports = class DebugLogger {
  constructor(name) {
    assert.ok(name, 'Name must be provided');
    const logKeys = resolve(name);

    this._info = debug(logKeys['info']);
    this._debug = debug(logKeys['debug']);
    this._error = debug(logKeys['error']);
  }

  debug() {
    DebugLogger._logWith(this._debug, Array.from(arguments));
  }

  info() {
    DebugLogger._logWith(this._info, Array.from(arguments));
  }

  error() {
    DebugLogger._logWith(this._error, Array.from(arguments));
  }

  static _logWith(logger, argsArray) {
    logger.apply(logger, argsArray.map(el => debug.coerce(el)));
  }
};
