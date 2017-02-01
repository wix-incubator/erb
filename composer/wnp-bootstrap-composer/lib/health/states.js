const assert = require('assert');

const delays = {
  startup: 5000,
  healthy: 60000,
  unhealthy: 15000
};

class State {
  constructor(delay) {
    this._delay = delay;
  }
  
  get delay() {
    return this._delay;
  }
}

class StartupState extends State {
  constructor() {
    super(delays.startup);
    this._status = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  get status() {
    return this._status;
  }

  next(thenableResult) {
    return thenableResult
      .then(res => {
        this._resolve(res);
        return new HealthyState(thenableResult);
      })
      .catch(err => {
        this._reject(err);
        return this._status.catch(() => this);
      });
  }
}

class HealthyState  extends State {
  constructor(status) {
    super(delays.healthy);
    assert(status, 'status is mandatory');
    this._status = status;
  }

  get status() {
    return this._status;
  }

  next(thenableResult) {
    return thenableResult
      .then(() => {
        this._status = thenableResult;
        return this;
      })
      .catch(() => new UnhealthyState(thenableResult));
  }
}


class UnhealthyState extends State {
  constructor(status) {
    super(delays.unhealthy);
    assert(status, 'status is mandatory');
    this._status = status;
    this._passCount = 0;
  }

  get status() {
    return this._status;
  }

  next(thenableResult) {
    return thenableResult
      .then(() => {
        this._passCount++;
        if (this._passCount === 3) {
          return new HealthyState(thenableResult);
        } else {
          return this;
        }
      })
      .catch(() => {
        this._status = thenableResult;
        return this;
      })
  }
}

module.exports.delays = delays;
module.exports.Unhealthy = UnhealthyState;
module.exports.Startup = StartupState;
module.exports.Healthy = HealthyState;
