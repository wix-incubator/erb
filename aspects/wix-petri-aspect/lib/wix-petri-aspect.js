'use strict';
const aspects = require('wix-aspects');

module.exports.builder = () => requestData => new WixPetriAspect(requestData);

const petriCookiePattern = '_wixAB3';
const halfYearInMillis = 1000 * 86400 * 30 * 6;

class WixPetriAspect extends aspects.Aspect {
  constructor(requestData) {
    super('petri', requestData);
    this._cookieDomain = aspects.utils.resolveCookieDomain(requestData.url);
    this._aspect = {cookies: this._build(requestData)};
  }

  _build(requestData) {
    const cookies = requestData && requestData.cookies ? requestData.cookies : {};
    const petriCookies = {};
    Object.keys(cookies).forEach(key => {
      if (key.startsWith(petriCookiePattern)) {
        petriCookies[key] = cookies[key];
      }
    });

    return Object.freeze(petriCookies);
  }

  get cookies() {
    return this._aspect.cookies;
  }

  export() {
    const responseData = {cookies: []};
    const cookies = this._aspect.cookies;
    Object.keys(cookies).forEach(key => {
      responseData.cookies.push({
        key: key,
        value: cookies[key],
        properties: {maxAge: halfYearInMillis, domain: this._cookieDomain, encode: String}
      });
    });

    return responseData;
  }

  import(data) {
    this._aspect.cookies = Object.freeze(Object.assign({}, this._aspect.cookies, this._build(data)));
  }
}