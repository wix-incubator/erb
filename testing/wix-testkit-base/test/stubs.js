'use strict';
const tb = require('..');

class TestkitStub extends tb.TestkitBase {
  constructor(failStart, failStop, delayIfAny) {
    super();
    this.delay = delayIfAny || 1;
    this.failStart = failStart || false;
    this.failStop = failStop || false;
    this.running = false;
    this.cycleCount = 0;
  }

  doStart() {
    if (this.failStart === true) {
      return Promise.reject(Error('start failed'));
    } else {
      return delayIfAny(this.delay).then(() => {
        this.running = true;
        this.cycleCount += 1;
      });
    }
  }

  doStop() {
    if (this.failStop === true) {
      return Promise.reject(Error('stop failed'));
    } else {
      return delayIfAny(this.delay).then(() => this.running = false);
    }
  }
}

module.exports = TestkitStub;

function delayIfAny(delayMs) {
  return new Promise(resolve => setTimeout(() => resolve(), delayMs));
}