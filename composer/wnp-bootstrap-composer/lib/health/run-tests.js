const Promise = require('bluebird'),
  _ = require('lodash'),
  errors = require('wix-errors'),
  logger = require('wnp-debug')('health-tests');

const defaultTimeout = 25000;

function runTests(tests, {log = logger, timeout = defaultTimeout} = {log: logger, timeout: defaultTimeout}) {
  return Promise
    .props(_.mapValues(tests, (fn, key) => asResolvableWithOutcome(fn, key, log, timeout)))
    .then(res => {
      if (_.values(res).find(el => el instanceof Failure)) {
        return Promise.reject(new RunTestsError(res));
      } else {
        return Promise.resolve(res);
      }
    });
}

function asResolvableWithOutcome(fn, key, log, timeout) {
  const withLogError = logError(key, log);
  return withLogError(retrying(() => Promise.method(fn)().timeout(timeout)))
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

module.exports.run = runTests;
module.exports.Success = Success;
module.exports.Failure = Failure;
