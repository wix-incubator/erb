'use strict';
var wixDomain = require('wix-domain');

exports.set = petriCookies => {
  let current = wixDomain.get();

  if (!current.petriCookies) {
    Object.freeze(petriCookies);
    current.petriCookies = petriCookies;
  }
};

exports.get = () => {
  return wixDomain.get().petriCookies || {};
};

