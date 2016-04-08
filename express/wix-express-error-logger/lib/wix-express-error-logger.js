'use strict';
const debug = require('debug')('wnp:express-error-logger');

module.exports = function errorLogger(req, res, next) {
  res.on('x-error', err => debug(err));
  res.on('x-timeout', err => debug(err));
  next();
};