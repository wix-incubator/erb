'use strict';
var _ = require('lodash'),
  cookiesUtil = require('cookies-utils');
var wixDomain = require('wix-domain');

exports.middleware = function () {
  return function (req, res, next) {
    var domain = wixDomain.get();
    var cookies = {};
    var reqCookies = cookiesUtil.toDomain(req.headers['cookie']);

    Object.keys(reqCookies).map(function (key) {
      if (_.startsWith(key, "_wixAB3"))
        cookies[key] = reqCookies[key];
    });
    domain.petriCookies = cookies;
    next();
  };

  // todo add another function that writes the headers to response
};


