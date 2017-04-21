const _ = require('lodash'),
  logger = require('wnp-debug')('wix-express-metering'),
  WixMeasuredMetering = require('wix-measured-metering');

const metadataKey = '_wix_metering';

class Cached {
  
  constructor(valueFn, keyFn = key => key) {
    this._valueFn = valueFn;
    this._keyFn = keyFn;
    this._cached = {};
  }
  
  get(key) {
    const k = this._keyFn(key);
    if (!this._cached[k]) {
      this._cached[k] = this._valueFn(key);
    }
    return this._cached[k];
  }
}

module.exports.factory = (wixMeasuredFactory, log = logger) => {

  const meteringByTag = new Cached(tag => {
    return new WixMeasuredMetering(wixMeasuredFactory
      .collection('tag', tag)
      .collection('type', 'express'));
  });
  
  const rawByKey = new Cached(({tag, resource}) => {
    const measured = meteringByTag.get(tag);
    return measured.raw('resource', resource);
  }, ({method, resource}) => `${method}_${resource}`);
  
  function rawFor(tag, method, route) {
    const resource = `${method.toLowerCase()}_${route.path.toString().slice(1)}`;
    return rawByKey.get({tag, method, resource});
  }
  
  function routesMetering(req, res, next) {
    req[metadataKey] = {start: Date.now()};

    res.once('finish', () => {
      try {
        const metadata = req[metadataKey];
        if (metadata) {
          const raw = rawFor(tagFrom(req), req.method, req.route || {path: '/unresolved_route'});
          if (metadata.error) {
            raw.reportError(metadata.error);
          } else if (erroneousHttpStatus(res)) {
            raw.reportError(`HTTP_STATUS_${res.statusCode}`)
          } else {
            raw.reportDuration(Date.now() - metadata.start);
          }
        }
      } catch(e) {
        log.error(`Response.finish event handling failed: ${e}`)
      }
      delete req[metadataKey];
    });
    next();
  }
  
  function errorsMetering(err, req, res, next) {
    const metadata = ensureMetadata(req); 
    //TODO: due to node.js domain & possible leakage issues we shouldn't store error, only required metadata 
    req[metadata] = Object.assign(metadata, {error: err});
    next(err);
  }
  
  return {routesMetering, errorsMetering}
};

function ensureMetadata(req) {
  const existingOrEmpty = req[metadataKey] || {};
  req[metadataKey] = existingOrEmpty;
  return existingOrEmpty;
}

function erroneousHttpStatus(res) {
  return res.statusCode && !_.inRange(res.statusCode, 100, 400);
}

function tagFrom(req) {
  return req[metadataKey].tag || 'WEB';
}

module.exports.tagging = tag => (req, res, next) => {
  ensureMetadata(req).tag = tag;
  next();
};
