'use strict';
const _ = require('lodash'),
  cookieUtils = require('cookie-utils'),
  wixPetri = require('wix-petri');

const petriCookiePattern = '_wixAB3';

module.exports = (req, res, next) => {
  let reqCookies = cookieUtils.fromHeader(req.headers['cookie']);
  let petriCookies = {};

  _.forEach(reqCookies, (value, key) => {
    if (_.startsWith(key, petriCookiePattern)) {
      petriCookies[key] = value;
    }
  });

    wixPetri.set(petriCookies);
    next();
};


