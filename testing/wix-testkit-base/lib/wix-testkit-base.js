'use strict';
const _ = require('lodash');

class TestkitBase {
  constructor() {
    this.running = false;
  }

  start(done) {
    if (this.running === true) {
      return Promise.reject(new Error('service was already started'));
    } else {
      return handlePromise(done, this.doStart()).then(() => {
        this.running = true;
      });
    }
  }

  stop(done) {
    if (this.running === false) {
      return Promise.reject(new Error('service is not running'));
    } else {
      return handlePromise(done, this.doStop());
    }
  }

  beforeAndAfter() {
    if (isJasmine()) {
      beforeAll(done => this.start(done));
      afterAll(done => this.stop(done));
    } else {
      before(() => this.start());
      after(() => this.stop());
    }
    return this;
  }

  beforeAndAfterEach() {
    beforeEach(done => this.start(done));
    afterEach(done => this.stop(done));
    return this;
  }
}

function isJasmine() {
  return _.isFunction(global.beforeAll);
}

function handlePromise(done, promise) {
  const cb = done || _.noop;
  return promise.then(() => cb())
    .catch(err => {
      cb(err);
      throw err;
    });
}

module.exports.TestkitBase = TestkitBase;