'use strict';
const wixDomain = require('wix-domain');

module.exports = (req, res, next) => {
  const current = wixDomain.get();
  current.add(req);
  current.add(res);
  current.run(next);
};