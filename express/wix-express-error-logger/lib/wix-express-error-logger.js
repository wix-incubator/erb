module.exports = log => {
  return function errorLogger(err, req, res, next) {
    log.error(err);
    next(err);
  }
};
