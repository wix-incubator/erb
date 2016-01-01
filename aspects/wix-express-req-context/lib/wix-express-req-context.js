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
    // TODO - Extract more parametets and save to context
    requestId: requestId.getOrCreate(req),
    userAgent: req.header('user-agent'),
    url: _.find([req.header('x-wix-url'), req.originalUrl]),
    localUrl: req.originalUrl,
    userPort: remotePortResolver.resolve(req),
    // language: undefined TODO ,
    userIp: remoteIpResolver.resolve(req)
  });

  next();
};

function notEmpty(reqContext) {
  return (reqContext.requestId !== undefined);
}