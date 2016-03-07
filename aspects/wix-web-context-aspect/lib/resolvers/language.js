'use strict';
const acceptLanguage = require('accept-language-parser'),
  urlParse = require('url').parse;

exports.resolve = (headers, cookies) => {
  return languageFromRpcHeader(headers) ||
    languageFromDomain(headers) ||
    languageFromWixHeader(headers) ||
    languageFromCookie(cookies) ||
    languageFromAcceptLanguageHeader(headers);
};

function languageFromCookie(cookies) {
  return cookies['wixLanguage'];
}

function languageFromAcceptLanguageHeader(headers) {
  const headerValue = headers['accept-language'];
  if (headerValue) {
    const parse = acceptLanguage.parse(headerValue);
    return (parse.length > 0) ? parse[0].code : undefined;
  }
}

function languageFromWixHeader(headers) {
  const headerValue = headers['x-wix-base-uri'];
  if (headerValue) {
    const url = urlParse(headerValue);
    return (url && url.host) ? langFromHost(url.host) : undefined;
  }
}

function languageFromDomain(headers) {
  return langFromHost(headers['host']);
}

function languageFromRpcHeader(headers) {
  return headers['x-wix-language'];
}

function langFromHost(host) {
  if (host) {
    const index = host.indexOf('.');
    if (index !== -1) {
      const lang = host.substring(0, index);
      if (lang.length === 2) {
        return lang;
      }
    }
  }
}