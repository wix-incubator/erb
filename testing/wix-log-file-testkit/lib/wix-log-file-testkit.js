'use strict';
const TestkitBase = require('wix-testkit-base').TestkitBase,
  shelljs = require('shelljs');

module.exports = pattern => new WixLogFileTestkit(pattern);

class WixLogFileTestkit extends TestkitBase {
  constructor(pattern) {
    super();
    this._pattern = pattern;
    this._reset();
  }

  get captured() {
    if (this.isRunning) {
      this._curr = shelljs.cat(this._pattern).replace(this._prev, '');
    }

    return this._curr;
  }

  doStart() {
    return Promise.resolve().then(() => this._reset());
  }

  doStop() {
    return Promise.resolve();
  }

  _reset() {
    this._prev = shelljs.cat(this._pattern);
    this._curr = '';
  }
}