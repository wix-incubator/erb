'use strict';
const _ = require('lodash'),
  reqContext = require('wix-req-context'),
  requestId = require('./requestId');

module.exports = (req, res, next) => {
  let current = reqContext.get();

  if (notEmpty(current)) {
    throw new Error('req context population called though req context is already populated.');
  }

  reqContext.set({
    // TODO - Extract more parametets and save to context
    requestId: requestId.getOrCreate(req),
    userAgent: req.header('user-agent'),
    url: _.find([req.header('X-WIX-URL'), req.originalUrl]),
    localUrl: req.originalUrl,
    //app_url: undefined,
    //local_ip: undefined,
    //port: undefined,
    // language: undefined,
    //request_protocol: undefined
    ip: req.ip
  });

  next();
};

function notEmpty(reqContext) {
  return (reqContext.requestId !== undefined);
}