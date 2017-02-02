'use strict';
const acceptLanguage = require('accept-language-parser'),
  urlParse = require('url').parse;

const resolvers = [
  (headers, cookies, queryParams) => languageFromQueryParams(queryParams),
  headers => languageFromRpcHeader(headers),
  headers => languageFromDomain(headers),
  headers => languageFromWixHeader(headers),
  (headers, cookies) => languageFromCookie(cookies),
  headers => languageFromAcceptLanguageHeader(headers)
].map(fn => (headers, cookies, queryParams) => languageOrUndefined(fn(headers, cookies, queryParams)));

//TODO: figure out a good way to keep it aligned with scala fw or a way to detect desyncs
//Source: https://github.com/wix-platform/wix-framework/blob/f86fea548916977c01038bd9119d9b15dcbb3d32/localization-modules/wix-localization/src/main/java/com/wixpress/framework/i18n/SupportedLanguageResolver.scala#L59
exports.supportedLanguages = new Set(['de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'tr', 'nl', 'sv', 'no', 'da', 'hi']);

exports.resolve = (headers, cookies, queryParams) => {
  let language = 'en';
  
  for (let resolver of resolvers) {
    const resolvedLanguage = resolver(headers, cookies, queryParams);
    if (resolvedLanguage) {
      return resolvedLanguage;
    }
  }

  return language;
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

function languageOrUndefined(lang) {
  if (lang) {
    return exports.supportedLanguages.has(lang.toLowerCase()) ? lang : undefined;
  } else {
    return undefined;
  }
}

function languageFromQueryParams(queryParams) {
  return queryParams && queryParams.overrideLocale;
}
