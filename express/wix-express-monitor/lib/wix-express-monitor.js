'use strict';
module.exports.get = (onRequestCompleted) => {
  return (req, res, next) => {
    const start = process.hrtime();
    const metrics = initialMetrics();

    res.on('x-before-flushing-headers', () =>
      metrics.timeToFirstByteMs = hrtimeToMilliSec(start)
    );

    res.on('x-error', error =>
      metrics.errors.push(error)
    );

    res.on('x-timeout', message => {
      metrics.timeout = true;
      metrics.errors.push(new TimeoutError(message));
    });

    req.setOperationName = function setOperationName(operationName) {
      metrics.operationName = operationName;
    };

    res.on('finish', () => {
      metrics.durationMs = hrtimeToMilliSec(start);
      metrics.statusCode = res.statusCode;
      metrics.operationName = metrics.operationName || req.route.path;
      onRequestCompleted(metrics);
    });

    next();
  };
};

function initialMetrics() {
  return {
    operationName: undefined,
    startTime: new Date().toISOString(),
    timeToFirstByteMs: undefined,
    durationMs: undefined,
    timeout: false,
    errors: []
  };
}

function hrtimeToMilliSec(hr) {
  let diff = process.hrtime(hr);
  return diff[0] * 1000 + diff[1] / 1000000;
}

function TimeoutError(message) {
  Error.captureStackTrace(this);
  this.message = message;
  this.name = 'TimeoutError';
}
TimeoutError.prototype = Object.create(Error.prototype);