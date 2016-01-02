'use strict';
const _ = require('lodash'),
  reqContext = require('wix-req-context'),
  remoteIpResolver = require('./remote-ip-resolver'),
  remotePortResolver = require('./remote-port-resolver'),
  requestId = require('./requestId');

module.exports = (req, res, next) => {
  let current = reqContext.get();

  if (notEmpty(current)) {
    throw new Error('req context is already populated.');
  }
  reqContext.set({
    requestId: requestId.getOrCreate(req),
    userAgent: req.header('user-agent'),
    url: _.find([req.header('x-wix-url'), url(req)]),
    localUrl: req.originalUrl,
    userPort: remotePortResolver.resolve(req),
    // language: undefined TODO ,
    // GEO
    userIp: remoteIpResolver.resolve(req)
  });

  next();
};

// todo - talk to Vilius about that
var url = req => req.protocol + '://' + req.get('host') + req.originalUrl;

function notEmpty(reqContext) {
  return (reqContext.requestId !== undefined);
}