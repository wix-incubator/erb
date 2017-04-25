const Tokens = require('csrf');
const tokens = new Tokens();

module.exports = req => {
  const xsrfSecret = req.headers['x-xsrf-token'] || '';
  return xsrfSecret ? tokens.create(xsrfSecret) : '';
};
