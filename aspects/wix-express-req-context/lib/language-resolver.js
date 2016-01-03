'use strict';

const _ = require('lodash'),
  cookieUtils = require('cookie-utils'),
  acceptLanguage = require('accept-language-parser'),
  urlParse = require('url-parse'),
  option = require('option');


exports.resolve = request => {
  return _.reduce([languageFromRpcHeader,
    languageFromDomain,
    languageFromWixHeader,
    languageFromCookie,
    languageFromAcceptLanguageHeader], (result, resolver) => {
    return isNone(result) ? resolver(request) : result;
  }, option.none).valueOrElse(null);

};

// Hack - i will do pull request for flatMap in option npm
var isNone = (opt) => {
  return opt.isNone() || option.fromNullable(opt.value()).isNone();
};

var languageFromCookie = request => {
  return option.fromNullable(cookieUtils.fromHeader(request.headers['cookie'])['wixLanguage']);
};


var languageFromAcceptLanguageHeader = request => {
  return option.fromNullable(request.headers['accept-language'])
    .map((headerValue) => {
      let parse = acceptLanguage.parse(headerValue);
      return (parse.length > 0) ? parse[0].code : null;
    });
};

var languageFromWixHeader = request => {
  return option.fromNullable(request.headers['x-wix-base-uri'])
    .map((headerValue) => {
      const url = urlParse(headerValue);
      return (url && url.host) ? langFromHost(url.host) : option.none;
    });
};

var languageFromDomain = request => {
  return option.fromNullable(langFromHost(request.get('host')));
};

var languageFromRpcHeader = request => {
  return option.fromNullable(request.headers['x-wix-language']);
};

var langFromHost = host => {
  const index = host.indexOf('.');
  if (index !== -1) {
    const lang = host.substring(0, index);
    if (lang.length === 2) {
      return lang;
    }
  }
  return null;
};