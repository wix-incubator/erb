const Promise = require('bluebird'),
  _ = require('lodash');

const defaultTimeout = 25000;

function runTests(tests, timeout = defaultTimeout) {
  return Promise
    .props(_.mapValues(tests, fn => asResolvableWithOutcome(fn, timeout)))
    .then(res => {
      if (_.values(res).find(el => el instanceof Failure)) {
        return Promise.reject(new RunTestsError(res));
      } else {
        return Promise.resolve(res);
      }
    });
}

function asResolvableWithOutcome(fn, timeout) {
  return retrying(() => Promise.method(fn)().timeout(timeout))
    .then(res => new Success(res))
    .catch(err => new Failure(err));
}

function retrying(thenableFn, count = 3) {
  return thenableFn().catch(e => (count === 1) ? Promise.reject(e) : retrying(thenableFn, --count));
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

class RunTestsError extends Error {
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
