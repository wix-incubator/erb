const assert = require('assert'),
  {ErrorCode} = require('wix-errors');

const defaultErrorCode = ErrorCode.UNKNOWN;

module.exports = class WixMeasuredMetering {
  constructor(measuredClient) {
    assert(measuredClient, 'measured client is mandatory');
    this._measuredClient = measuredClient;
  }

  promise(key, name) {
    const hist = this._measuredClient.hist(key, name);
    const meter = this._measuredClient.meter(key, name);
    const collectionForErrors = this._measuredClient.collection(key, name);
    const errors = {};
    return fnWithPromiseReturn => {
      const before = Date.now();
      return () => fnWithPromiseReturn()
        .then(res => {
          const duration = Date.now() - before;
          hist(duration);
          meter(1);
          return res;
        }).catch(e => {
          const {errorName, errorCode} = errorNameAndCode(e);
          const errorKey = `${errorName}_${errorCode}`;
          if (!errors[errorKey]) {
            errors[errorKey] = collectionForErrors.collection('error', errorName).meter('code', errorCode.toString());
          }
          errors[errorKey](1);
          return Promise.reject(e);
        });
    }
  }
};

function errorNameAndCode(maybeError) {
  if (maybeError instanceof Error) {
    return {errorName: maybeError.name, errorCode: maybeError.errorCode || defaultErrorCode};
  } else if (typeof maybeError === 'string') {
    return {errorName: maybeError, errorCode: defaultErrorCode};
  } else {
    return {errorName: 'no-name', errorCode: defaultErrorCode};
  }
}
