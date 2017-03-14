const assert = require('assert'),
  {ErrorCode} = require('wix-errors'),
  _ = require('lodash');

const defaultErrorCode = ErrorCode.UNKNOWN;

module.exports = class WixMeasuredMetering {
  constructor(measuredClient, now = () => Date.now()) {
    assert(measuredClient, 'measured client is mandatory');
    this._measuredClient = measuredClient;
    this._now = now;
  }
  
  raw(key, name) {
    const reportDuration = (durationInMillis) => {
      assert(durationInMillis && _.isNumber(durationInMillis) && durationInMillis >= 0, 'duration parameter is required and has to be a non-negative number');
      const {hist, meter} = createMetrics(this._measuredClient, key, name);
      hist(durationInMillis);
      markExecuted(meter);
    };
    
    const reportError = err => {
      assert(err, 'error parameter is required');
      const {collectionForErrors, reportedErrors} = createMetrics(this._measuredClient, key, name);
      markExecuted(getOrCreateNewErrorReporter(err, reportedErrors, collectionForErrors));
    };
    
    return {reportDuration, reportError}
  };

  promise(key, name) {
    const {hist, meter, collectionForErrors, reportedErrors} = createMetrics(this._measuredClient, key, name);

    return fnWithPromiseReturn => {
      return () => {
        const before = this._now();
        return fnWithPromiseReturn()
          .then(res => {
            captureDuration(hist, before, this._now());
            markExecuted(meter);
            return res;
          }).catch(e => {
            markExecuted(getOrCreateNewErrorReporter(e, reportedErrors, collectionForErrors));
            return Promise.reject(e);
          });
      }
    }
  }
};

function getOrCreateNewErrorReporter(error, reportedErrors, collectionForErrors) {
  const {errorName, errorCode} = errorNameAndCode(error);
  const errorKey = `${errorName}_${errorCode}`;
  if (!reportedErrors[errorKey]) {
    reportedErrors[errorKey] = collectionForErrors.collection('error', errorName).meter('code', errorCode.toString());
  }
  return reportedErrors[errorKey];
}

function markExecuted(meter) {
  meter(1);
}

function captureDuration(hist, before, now) {
  hist(now - before);
}

function createMetrics(measuredClient, key, name) {
  const hist = measuredClient.hist(key, name);
  const meter = measuredClient.meter(key, name);
  const collectionForErrors = measuredClient.collection(key, name);
  const reportedErrors = {};

  return {hist, meter, collectionForErrors, reportedErrors};
}

function errorNameAndCode(maybeError) {
  if (maybeError instanceof Error) {
    return {errorName: maybeError.name, errorCode: maybeError.errorCode || defaultErrorCode};
  } else if (typeof maybeError === 'string') {
    return {errorName: maybeError, errorCode: defaultErrorCode};
  } else {
    return {errorName: 'no-name', errorCode: defaultErrorCode};
  }
}
