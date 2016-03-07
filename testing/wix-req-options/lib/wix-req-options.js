'use strict';
const cookieUtils = require('cookie-utils'),
  petriMixin = require('./mixins/petri'),
  biMixin = require('./mixins/bi'),
  sessionMixin = require('./mixins/session'),
  webContextMixin = require('./mixins/web-context');

module.exports.builder = () => new WixHeadersBuilder();

class WixHeadersBuilder {
  constructor() {
    this.cookies = {};
    this.headers = {};

    petriMixin.addTo(this);
    webContextMixin.addTo(this);
    biMixin.addTo(this);
    sessionMixin.addTo(this);
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