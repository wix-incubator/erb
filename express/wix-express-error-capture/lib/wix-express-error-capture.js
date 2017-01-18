'use strict';
const domain = require('domain');

exports.async = AsyncErrorMiddlware;
exports.sync = SyncErrorMiddleware;

function AsyncErrorMiddlware(req, res, next) {
  // we create, or rereference domain if it is left from previous error.
  // cannot dispose stale domain as it might still be used by other req.
  const current = process.domain = domain.create();

  current.add(req);
  current.add(res);
  current.once('error', err => res.emit('x-error', err));
  next();
}

function SyncErrorMiddleware(err, req, res, next) {
  const error = markErrorAsApplicative(err);
  res.emit('x-error', error);
  next();
}

function markErrorAsApplicative(err) {
  const res = (typeof err === 'string') ? new Error(err) : err;
  res.applicative = true;
  return res;
}
