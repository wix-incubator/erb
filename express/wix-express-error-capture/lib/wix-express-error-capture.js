'use strict';
const wixDomain = require("wix-domain");

exports.async = AsyncErrorMiddlware;
exports.sync = SyncErrorMiddleware;

function AsyncErrorMiddlware(req, res, next) {
  wixDomain.get().on('error', error => {
    return res.emit('x-error', error);
  });
  next();
}

function SyncErrorMiddleware(err, req, res, next) {
  res.emit('x-error', err);
  //TODO: really no need for next?
}
