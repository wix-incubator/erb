const log = require('wnp-debug')('express-error-logger');

module.exports = function errorLogger(req, res, next) {
  res.on('x-error', err => log.error(err));
  res.on('x-timeout', err => log.error(err));
  next();
};
