'use strict';
var wixDomain = require('wix-domain');

exports.set = biData => {
  let current = wixDomain.get();
  current.biData = biData;
};

exports.get = () => {
  return wixDomain.get().biData || {};
};

