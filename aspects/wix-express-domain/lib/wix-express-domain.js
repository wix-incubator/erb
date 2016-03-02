'use strict';
const domain = require('domain');

module.exports = function wixExpressDomain(req, res, next) {
  // we create, or rereference domain if it is left from previous error.
  // cannot dispose stale domain as it might still be used by other req.
  const current = process.domain = domain.create();

  current.add(req);
  current.add(res);
  current.run(next);
};