'use strict';
const _ = require('lodash'),
  cookieUtils = require('cookie-utils'),
  wixRequestContext = require('wix-req-context'),
  wixPetri = require('wix-petri');

const petriCookiePattern = '_wixAB3';
const halfYearInMillis = 1000 * 86400 * 30 * 6;

module.exports = function wixExpressPetri(req, res, next) {
  let reqCookies = cookieUtils.fromHeader(req.headers['cookie']);
  let petriCookies = {};

  _.forEach(reqCookies, (value, key) => {
    if (_.startsWith(key, petriCookiePattern)) {
      petriCookies[key] = value;
    }
  });


    wixPetri.set({cookies: petriCookies});

  res.on('x-before-flushing-headers', () => {
    let cookies = wixPetri.get().cookies;
    for(var key in cookies){
      res.cookie(key, cookies[key], { maxAge: halfYearInMillis, domain: wixRequestContext.get().cookieDomain, encode: String});
    }
  });

    next();
};


