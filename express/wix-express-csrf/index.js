const csurf = require('csurf'),
  extractCsrfSecret = require('./lib/extract-csrf-secret'),
  handleCsurfErrors = require('./lib/handle-csrf-errors');

module.exports = () => [
  handleCsurfErrors,
  csurf({
    cookie: {key: 'XSRF-TOKEN'},
    value: extractCsrfSecret
  })
];
