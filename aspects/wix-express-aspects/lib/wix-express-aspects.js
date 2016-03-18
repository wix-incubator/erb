'use strict';
const cookieUtils = require('cookie-utils'),
  wixAspects = require('wix-aspects');

//TODO: make it resilient!!
module.exports.get = function wixExpressAspects(aspectBuilders) {

  return function wixExpressAspects(req, res, next) {
    const store = wixAspects.buildStore(buildReqObject(req), aspectBuilders);
    req.aspects = store;

    res.on('x-before-flushing-headers', () => {
      Object.keys(store).forEach(key => writeToResponse(store[key].export(), res));
    });

    next();
  };
};

function buildReqObject(req) {
  return {
    headers: req.headers,
    cookies: cookieUtils.fromHeader(req.headers['cookie']),
    query: req.query,
    url: `${req.protocol}://${req.headers['host']}${req.originalUrl}`,
    originalUrl: req.originalUrl,
    remoteAddress: req.connection.remoteAddress,
    remotePort: req.connection.remotePort
  };
}

function writeToResponse(resObject, res) {
  if (resObject && resObject.headers) {
    res.set(resObject.headers);
  }

  if (resObject && resObject.cookies) {
    resObject.cookies.forEach(cookie => res.cookie(cookie.key, cookie.value, cookie.properties));
  }
}