'use strict';
const tb = require('..');

class TestkitStub extends tb.TestkitBase {
  constructor(failStart, failStop) {
    super();
    this.failStart = failStart || false;
    this.failStop = failStop || false;
    this.running = false;
    this.cycleCount = 0;
  }

  doStart() {
    if (this.failStart === true) {
      return Promise.reject(Error('start failed'));
    } else {
      return Promise.resolve().then(() => {
        this.running = true;
        this.cycleCount += 1;
      });
    }
  }

  doStop() {
    if (this.failStop === true) {
      return Promise.reject(Error('stop failed'));
    } else {
      return Promise.resolve().then(() => this.running = false);
    }
  }
}

module.exports = TestkitStub;