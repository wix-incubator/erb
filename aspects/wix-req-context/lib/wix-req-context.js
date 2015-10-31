'use strict';
var wixDomain = require('wix-domain');

exports.set = reqContext => {
  let current = wixDomain.get();

  if (!current.reqContext) {
    Object.freeze(reqContext);
    current.reqContext = reqContext;
  }
};

exports.get = () => {
  return wixDomain.get().reqContext || {};
};

