'use strict';
var wixDomain = require("wix-domain");

exports.asyncErrorMiddleware = function AsyncErrorMiddlware(req, res, next){
  wixDomain.get().on('error', function AsyncErrorHandler(error) {
    return res.emit('x-error', error);
  });
  next();
};

exports.syncErrorMiddleware = function SyncErrorMiddleware(err, req, res, next) {
  res.emit('x-error', err);
};