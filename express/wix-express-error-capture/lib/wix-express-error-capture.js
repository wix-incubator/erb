'use strict';
const wixDomain = require('wix-domain');

exports.async = AsyncErrorMiddlware;
exports.sync = SyncErrorMiddleware;

function AsyncErrorMiddlware(req, res, next) {
  wixDomain.get().on('error', err => res.emit('x-error', err));
  next();
}

function SyncErrorMiddleware(err, req, res, next) {
  res.emit('x-error', err);
  next();
}
