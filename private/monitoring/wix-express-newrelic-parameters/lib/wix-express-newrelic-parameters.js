const extract = require('./request-introspector');

module.exports = newrelic => (req, res, next) => {
  newrelic.addCustomParameters(extract(req));
  next();
};
