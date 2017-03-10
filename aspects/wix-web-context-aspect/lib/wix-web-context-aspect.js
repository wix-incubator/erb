const Aspect = require('wix-aspects').Aspect,
  resolveRequestId = require('./resolvers/request-id').resolve,
  resolveUrl = require('./resolvers/url').resolve,
  resolvePort = require('./resolvers/remote-port').resolve,
  resolveIp = require('./resolvers/remote-ip').resolve,
  resolveCookieDomain = require('./resolvers/cookie-domain').resolve,
  resolveLanguage = require('./resolvers/language').resolve,
  resolveGeo = require('./resolvers/geo').resolve,
  resolveDebug = require('./resolvers/debug').resolve,
  injectSeenBy = require('./injectors/seen-by').inject;

module.exports.builder = seenBy => data => new WixWebContextAspect(data, seenBy);

class WixWebContextAspect extends Aspect {
  constructor(data, seenBy) {
    super('web-context', data);
    const headers = data.headers || {};
    const cookies = data.cookies || {};
    const query = data.query || {};

    this._setIfAny(resolveRequestId(headers, query), this._aspect, 'requestId');
    this._setIfAny(resolveUrl(headers, data.url), this._aspect, 'url');
    this._setIfAny(headers['user-agent'], this._aspect, 'userAgent');
    this._setIfAny(data.originalUrl, this._aspect, 'localUrl');
    this._setIfAny(resolvePort(headers, data.remotePort), this._aspect, 'userPort');
    this._setIfAny(resolveIp(headers, data.remoteAddress), this._aspect, 'userIp');
    this._setIfAny(resolveCookieDomain(this._aspect.url), this._aspect, 'cookieDomain');
    this._setIfAny(resolveLanguage(headers, cookies), this._aspect, 'language');
    this._setIfAny(resolveGeo(headers), this._aspect, 'geo');
    this._setIfAny([seenBy], this._aspect, 'seenBy');
    this._setIfAny(resolveDebug(query), this._aspect, 'debug');

    //TODO: move to commons.
    if (this._aspect.seenBy) {
      Object.freeze(this._aspect.seenBy);
    }

    if (this._aspect.geo) {
      Object.freeze(this._aspect.geo);
    }
  }

  get requestId() {
    return this._aspect.requestId;
  }

  get url() {
    return this._aspect.url;
  }

  get userAgent() {
    return this._aspect.userAgent;
  }

  get localUrl() {
    return this._aspect.localUrl;
  }

  get userPort() {
    return this._aspect.userPort;
  }

  get userIp() {
    return this._aspect.userIp;
  }

  get cookieDomain() {
    return this._aspect.cookieDomain;
  }

  get language() {
    return this._aspect.language;
  }

  get geo() {
    return this._aspect.geo;
  }

  get seenBy() {
    return this._aspect.seenBy;
  }

  get debug() {
    return this._aspect.debug;
  }

  export() {
    const res = {headers: {}};
    injectSeenBy(this._aspect.seenBy, res);
    return res;
  }

  import(data) {
    //TODO: make it more resilient to lowercase/uppercase header name
    if (data && data.headers && data.headers['x-seen-by']) {
      this._aspect.seenBy = this._aspect.seenBy.concat(data.headers['x-seen-by']);
    }
  }
}
