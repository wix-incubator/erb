'use strict';
const _ = require('lodash'),
  reqContext = require('wix-req-context'),
  remoteIpResolver = require('./remote-ip-resolver'),
  remotePortResolver = require('./remote-port-resolver'),
  geoResolver = require('./geo-resolver'),
  languageResolver = require('./language-resolver'),
  cookieDomainResolver = require('./cookie-domain-resolver'),
  requestId = require('./requestId');

module.exports.get = options => (req, res, next) => {
  let current = reqContext.get();

  if (notEmpty(current)) {
    throw new Error('req context is already populated.');
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
    res.set('X-Seen-By', reqContext.get().seenBy.join());
  });

  next();
};




function notEmpty(reqContext) {
  return (reqContext.requestId !== undefined);
}