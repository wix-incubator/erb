'use strict';

const wixBi = require('wix-bi'),
  cookieUtils = require('cookie-utils'),
  option = require('option');

module.exports = (req, res, next) => {

  var biContext = {};
  option.fromNullable(cookieUtils.fromHeader(req.headers['cookie']))
    .map((cookies) => {

      optionFromCookie('_wix_browser_sess', cookies)
        .map((cookie) => {
          biContext.globalSessionId = cookie;
        });

      optionFromCookie('_wixUIDX', cookies)
        .map((cookie) => {
          biContext.uidx = cookie;
        });

      optionFromCookie('_wixCIDX', cookies)
        .map((cookie) => {
          biContext.cidx = cookie;
        });
    });


  wixBi.set(biContext);
  next();
};

var optionFromCookie = (name, cookies) => option.fromNullable(cookies[name]);


