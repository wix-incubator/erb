/**
 * Created by yoava on 8/20/15.
 */


module.exports = function expressMonitorFactory(onRequestCompleted) {
  return function expressMonitorMiddleware(req, res, next) {
    var start = process.hrtime();
    var metrics = {
      operationName: "",
      start: hrtimeToMilliSec(start),
      startTime: new Date().toISOString(),
      timeToFirstByte: undefined,
      finish: undefined,
      timeout: undefined,
      errors: []
    };

    res.on("x-before-flushing-headers", function() {
      metrics.timeToFirstByte = hrtimeToMilliSec(process.hrtime(start));
    });

    res.on("x-timeout", function() {
      metrics.timeout = hrtimeToMilliSec(process.hrtime(start));
    });

    res.on("x-error", function(error) {
      metrics.errors.push(error)
    });

    res.on("finish", function() {
      metrics.finish = hrtimeToMilliSec(process.hrtime(start));
      metrics.statusCode = res.statusCode;
      if (!metrics.operationName && req.route)
        metrics.operationName = req.route.path;
      delete metrics.start;
      onRequestCompleted(metrics);
    });

    next();
  }
};

module.exports.setOperationName = function(res, name) {
  if (res.metrics)
    res.metrics.operationName = name;
};

module.exports.getOperationName = function(res) {
  if (res.metrics)
    return res.metrics.operationName;
  else
    return undefined;
};

function hrtimeToMilliSec(hr) {
  return hr[0] * 1000 + hr[1] / 1000000;
}

