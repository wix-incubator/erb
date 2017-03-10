const aspects = require('wix-aspects');
const parseOverrides = require('./parse-overrides');

module.exports.builder = () => requestData => new WixPetriAspect(requestData);

const petriCookiePattern = '_wixAB3';
const halfYearInMillis = 1000 * 86400 * 30 * 6;

class WixPetriAspect extends aspects.Aspect {
  constructor(requestData) {
    super('petri', requestData);
    this._cookieDomain = aspects.utils.resolveCookieDomain(requestData.url);
    this._aspect = {cookies: extractCookies(requestData), overrides: extractOverrides(requestData)};
  }

  get cookies() {
    return this._aspect.cookies;
  }

  get overrides() {
    return this._aspect.overrides;
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
    this._aspect.cookies = Object.freeze(Object.assign({}, this._aspect.cookies, extractCookies(data)));
  }
}

function extractCookies(requestData) {
  const cookies = requestData && requestData.cookies ? requestData.cookies : {};
  const petriCookies = {};
  Object.keys(cookies).forEach(key => {
    if (key.startsWith(petriCookiePattern)) {
      petriCookies[key] = cookies[key];
    }
  });

  return Object.freeze(petriCookies);
}

function extractOverrides(requestData) {
  const queryOverrides = parseOverrides(requestData.query && requestData.query['petri_ovr'], {
    pair: ';',
    keyValue: ':'
  });
  const cookiesOverrides = parseOverrides(requestData.cookies && requestData.cookies['petri_ovr'], {
    pair: '|',
    keyValue: '#'
  });
  const headerOverrides = parseOverrides(requestData.headers && requestData.headers['x-wix-petri-ex'], {
    pair: ';',
    keyValue: ':'
  });

  return Object.assign({}, headerOverrides, cookiesOverrides, queryOverrides);
}
