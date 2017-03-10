const cookieUtils = require('cookie-utils'),
  petriMixin = require('./mixins/petri'),
  biMixin = require('./mixins/bi'),
  sessionMixin = require('./mixins/session'),
  defaultHeadersMixin = require('./mixins/default-headers');

module.exports.builder = addDefaultHeaders => new WixHeadersBuilder(addDefaultHeaders);

class WixHeadersBuilder {
  constructor(addDefaultHeaders) {
    const addHeaders = typeof addDefaultHeaders === 'undefined' ? true : addDefaultHeaders;
    this.cookies = {};
    this.headers = {};

    defaultHeadersMixin.addTo(this);
    petriMixin.addTo(this);
    biMixin.addTo(this);
    sessionMixin.addTo(this);

    if (addHeaders) {
      this.withDefaultHeaders();
    }
  }

  withCookie(name, value) {
    this.cookies[name] = value;
    return this;
  }

  withHeader(name, value) {
    this.headers[name] = value;
    return this;
  }


  raw() {
    return {
      headers: this.headers,
      cookies: this.cookies
    };
  }

  options() {
    const res = {headers: this.headers};
    if (Object.keys(this.cookies).length > 0) {
      res.headers.cookie = cookieUtils.toHeader(this.cookies);
    }

    return res;
  }
}
