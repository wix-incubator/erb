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
  let val = request.headers['accept-language'];
  if(val){
    let parse = acceptLanguage.parse(val);
    if(parse.length > 0){
      return parse[0].code;
    }else {
      return null;
    }
  }else{
    return null;
  }
};

var languageFromWixHeader = request =>{
  let val = request.headers['x-wix-base-uri'];
  if(val){
    let url = urlParse(val);
    if(url && url.host){
      return langFromHost(url.host);
    }else {
      return null;
    }
  }else{
    return null;
  }
};

var languageFromDomain  = request => langFromHost(request.get('host'));

var languageFromRpcHeader = request => request.headers['x-wix-language'] || null;

var langFromHost = host =>{
  let index = host.indexOf('.');
  if(index !== -1){
    let lang = host.substring(0, index);
    if(lang.length === 2){
      return lang;
    }else {
      return null;
    }
  }else {
    return null;
  }
};