const _ = require('lodash');

const metadataKey = '_wix_metering';

module.exports = measured => {
  
  function routesMetering(req, res, next) {
    req[metadataKey] = {start: Date.now()};

    res.once('finish', () => {
      const metadata = req[metadataKey];
      if (req.route && metadata && notIsAliveRequest(req)) {
        const raw = measured.raw('resource', req.route.path.slice(1));
        if (metadata.error) {
          raw.reportError(metadata.error);
        } else if (erroneousHttpStatus(res)) {
          raw.reportError(`HTTP_STATUS_${res.statusCode}`)
        } else {
          raw.reportDuration(Date.now() - metadata.start);
        }
      }
      delete req[metadataKey];
    });
    next();
  }
  
  function errorsMetering(err, req, res, next) {
    const metadata = req[metadataKey] || {}; 
    //TODO: due to node.js domain & possible leakage issues we shouldn't store error, only required metadata 
    req[metadata] = Object.assign(metadata, {error: err});
    next(err);
  }
  
  return {routesMetering, errorsMetering}
};

function notIsAliveRequest(req) {
  return req.route.path !== '/health/is_alive';
}

function erroneousHttpStatus(res) {
  return res.statusCode && !_.inRange(res.statusCode, 100, 400);
}

