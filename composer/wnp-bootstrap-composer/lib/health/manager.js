const states = require('./states'),
  runTests = require('./run-tests').run,
  assert = require('assert'),
  _ = require('lodash');

module.exports = class HealthManager {
  constructor(setTimeoutOverride = setTimeout) {
    this._clearSchedule = _.noop; 
    this._setTimeout = setTimeoutOverride;
    this._tests = {};
    this._state = new states.Startup();
  }

  add(name, fn) {
    assert(name && typeof name === 'string', 'name is mandatory and must be a string');
    assert(fn && typeof fn === 'function', 'fn is mandatory and must be a function');
    assert(this._tests[name] === undefined, `health test '${name}' is already present`);
    this._tests[name] = fn;
    return this;
  }

  _loop() {
    return this._state
      .next(runTests(this._tests))
      .then(newState => this._state = newState)
      .then(() => this._scheduleNext());
  }

  _scheduleNext() {
    this._clearSchedule = this._setTimeout(() => this._loop(), this._state.delay);
  }

  start() {
    return this._loop();
  };
  
  stop() {
    clearTimeout(this._clearSchedule);
  }

  get status() {
    return this._state.status;
  }
};
