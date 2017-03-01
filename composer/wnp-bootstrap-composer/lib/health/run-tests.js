const Promise = require('bluebird'),
  _ = require('lodash'),
  errors = require('wix-errors'),
  logger = require('wnp-debug')('health-tests');

const defaultTimeout = 25000;

function healthTestWrapper({log = logger, timeout = defaultTimeout, metering} = {
  log: logger,
  timeout: defaultTimeout,
  metering: metering
}) {

  return (name, fn) => {
    const asPromise = Promise.method(fn);
    const withTimeout = () => asPromise().timeout(timeout);
    const meter = metering.promise('test', name)(withTimeout);
    const withMetering = () => meter();
    const withRetries = () => retrying(withMetering);
    const withLogError = () => logError(name, log)(withRetries());

    return () => asResolvableWithOutcome(withLogError(), timeout);
  }
}

function runTests(tests) {
  return Promise
    .props(_.mapValues(tests, fn => fn()))
    .then(res => {
      if (_.values(res).find(el => el instanceof Failure)) {
        return Promise.reject(new RunTestsError(res));
      } else {
        return Promise.resolve(res);
      }
    });
}

function asResolvableWithOutcome(thenable) {
  return thenable
    .then(res => new Success(res))
    .catch(err => new Failure(err));
}

function retrying(thenableFn, count = 3) {
  return thenableFn().catch(e => (count === 1) ? Promise.reject(e) : retrying(thenableFn, --count));
}

function logError(key, logger) {
  return promise => {
    return promise.catch(e => {
      logger.error(`HealthTest failure: ${key} - `, e);
      return Promise.reject(e);
    })
  }
}

class Outcome {
  constructor(isSuccess, description) {
    this._isSuccess = isSuccess;
    this._description = description;
  }

  get isSuccess() {
    return this._isSuccess;
  }

  toJSON() {
    return this._description;
  }

  toString() {
    return this._description;
  }
}

class Success extends Outcome {
  constructor(result) {
    super(true, `success (${result})`);
  }
}

class Failure extends Outcome {
  constructor(error) {
    super(false, `failure (${error})`);
  }
}

class RunTestsError extends errors.wixSystemError(errors.ErrorCode.HEALTH_TEST_FAILED) {
  constructor(outcomes) {
    super('tests failed');
    this.name = this.constructor.name;
    this._outcomes = outcomes;
  }

  get outcomes() {
    return this._outcomes;
  }
}

module.exports.wrapper = healthTestWrapper;
module.exports.run = runTests;
module.exports.Success = Success;
module.exports.Failure = Failure;
