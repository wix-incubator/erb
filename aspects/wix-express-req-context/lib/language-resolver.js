'use strict';

const _ = require('lodash'),
      cookieUtils = require('cookie-utils'),
      acceptLanguage = require('accept-language-parser'),
      urlParse  = require('url-parse');


exports.resolve = request => {

  return _.reduce([languageFromRpcHeader,
                   languageFromDomain,
                   languageFromWixHeader,
                   languageFromCookie,
                   languageFromAcceptLanguageHeader], (result, resolver) => {
    return result || resolver(request);
  }, null);

};


var languageFromCookie = request => cookieUtils.fromHeader(request.headers['cookie'])['wixLanguage'] || null;

var languageFromAcceptLanguageHeader = request => {
  const val = request.headers['accept-language'];
  if(val){
    let parse = acceptLanguage.parse(val);
    if(parse.length > 0){
      return parse[0].code;
    }
  }
  return null;
};

var languageFromWixHeader = request =>{
  const val = request.headers['x-wix-base-uri'];
  if(val){
    const url = urlParse(val);
    if(url && url.host){
      return langFromHost(url.host);
    }
  }
  return null;
};

var languageFromDomain  = request => langFromHost(request.get('host'));

var languageFromRpcHeader = request => request.headers['x-wix-language'] || null;

var langFromHost = host =>{
  const index = host.indexOf('.');
  if(index !== -1){
    const lang = host.substring(0, index);
    if(lang.length === 2){
      return lang;
    }
  }
  return null;
};