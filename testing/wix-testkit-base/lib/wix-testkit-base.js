'use strict';
const _ = require('lodash');

class TestkitBase {
  constructor() {
    this.running = false;
  }

  start(done) {
    return this._handleAction(done, true, () => this.doStart(), 'service was already started');
  }

  stop(done) {
    return this._handleAction(done, false, () => this.doStop(), 'service is not running');
  }

  _handleAction(doneCallback, isRunningCheck, actionFn, errorMsg) {
    const cb = doneCallback || _.noop;
    if (this.running === isRunningCheck) {
      const error = new Error(errorMsg);
      cb(error);
      return Promise.reject(error);
    } else {
      return actionFn()
        .then(() => {
          this.running = isRunningCheck;
          cb();
        }).catch(err => {
          cb(err);
          throw err;
        });
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

  get isRunning() {
    return this.running;
  }
}

function isJasmine() {
  return _.isFunction(global.beforeAll);
}

module.exports.TestkitBase = TestkitBase;