const domain = require('domain'),
  _ = require('lodash');

module.exports = (onError = _.noop) => {
  return function AsyncErrorMiddlware(req, res, next) {
    const current = domain.create();
    current.add(req);
    current.add(res);
    current.run(next);
    current.once('error', err => {
      const error = coerce(err);
      next(error);
      onError(error);
    });
  };
};

function coerce(err) {
  return (typeof err === 'string') ? new Error(err) : err;
}
