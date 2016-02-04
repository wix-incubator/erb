'use strict';
var wixDomain = require('wix-domain');

exports.set = petriCookies => {
  let current = wixDomain.get();

  current.petriCookies = petriCookies;
};

exports.get = () => {
  return wixDomain.get().petriCookies || {};
};

