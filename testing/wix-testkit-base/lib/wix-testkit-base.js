const _ = require('lodash');

class TestkitBase {
  constructor() {
    this.running = false;
  }

  start(done) {
    const cb = isJasmine() && done ? err => err ? done.fail(err) : done() : done;
    const res = this._handleAction(cb, true, () => this.doStart(), 'service was already started');
    if (!done) {
      return res;
    }
  }

  stop(done) {
    const cb = isJasmine() && done ? err => err ? done.fail(err) : done() : done;
    const res = this._handleAction(cb, false, () => this.doStop(), 'service is not running');
    if (!done) {
      return res;
    }
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

  beforeAndAfter(timeout) {
    if (isJasmine()) {
      beforeAll(done => this.start(done), timeout);
      afterAll(done => this.stop(done), timeout);
    } else {
      const self = this;
      before(function () {
        setTimeoutIfAny(this, timeout);
        return self.start();
      });
      after(function () {
        setTimeoutIfAny(this, timeout);
        return self.stop();
      });
    }
    return this;
  }

  beforeAndAfterEach(timeout) {
    if (isJasmine()) {
      beforeEach(done => this.start(done), timeout);
      afterEach(done => this.stop(done), timeout);
    } else {
      const self = this;
      beforeEach(function () {
        setTimeoutIfAny(this, timeout);
        return self.start();
      });
      afterEach(function () {
        setTimeoutIfAny(this, timeout);
        return self.stop();
      });

    }
    return this;
  }

  get isRunning() {
    return this.running;
  }
}

function isJasmine() {
  return _.isFunction(global.beforeAll);
}

function setTimeoutIfAny(context, timeout) {
  timeout && context.timeout(timeout);
}

module.exports.TestkitBase = TestkitBase;
