'use strict';
var wixDomain = require('wix-domain');

exports.set = wixSession => {
  let current = wixDomain.get();

  if (!current.wixSession) {
    Object.freeze(wixSession);
    current.wixSession = wixSession;
  }
};

exports.get = () => {
  return wixDomain.get().wixSession;
};

