'use strict';
const _ = require('lodash'),
  remoteIpResolver = require('./remote-ip-resolver'),
  remotePortResolver = require('./remote-port-resolver'),
  geoResolver = require('./geo-resolver'),
  languageResolver = require('./language-resolver'),
  cookieDomainResolver = require('./cookie-domain-resolver'),
  seenByUniqueHandler = require('./seen-by-unique-handler'),
  requestId = require('./requestId'),
  log = require('wix-logger').get('wix-express-req-context');

module.exports.get = (reqContext, options) => function wixExpressReqContext(req, res, next) {
  let current = reqContext.get();

  if (notEmpty(current)) {
    log.error(`Request context was already populated with: ${JSON.stringify(current)}`);
  }

  var url = req => req.protocol + '://' + req.get('host') + req.originalUrl;
  var resolvedUrl = _.find([req.header('x-wix-url'), url(req)]);

  reqContext.set({
    requestId: requestId.getOrCreate(req),
    userAgent: req.header('user-agent'),
    url: resolvedUrl,
    localUrl: req.originalUrl,
    userPort: remotePortResolver.resolve(req),
    language: languageResolver.resolve(req),
    geo: geoResolver.resolve(req),
    userIp: remoteIpResolver.resolve(req),
    seenBy: [options.seenByInfo],
    cookieDomain: cookieDomainResolver.resolve(resolvedUrl)
  });

  res.on('x-before-flushing-headers', () => {
    res.set('X-Seen-By', seenByUniqueHandler.calc(reqContext.get().seenBy).join());
  });

  next();
};

function notEmpty(reqContext) {
  return (reqContext.requestId !== undefined);
}