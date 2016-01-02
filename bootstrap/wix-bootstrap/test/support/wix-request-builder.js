'use strict';

const chance = require('chance')(),
  cookieUtils = require('cookie-utils'),
  _ = require('lodash'),
  sessionTestkit = require('wix-session-crypto-testkit');

exports.aWixRequest = (baseUrl) => new WixRequest(baseUrl);

function WixRequest(baseUrl) {
  this.baseUrl = baseUrl;
  this.cookies = {};
  this.headers = {
    'X-Wix-Request-Id': chance.guid()
  };

  this.get = part => {
    this.method = 'GET';
    this.url = this.baseUrl + (part || '/');
    return this;
  };

  this.withSession = () => {
    this.wixSession = sessionTestkit.aValidBundle();
    this.cookies[this.wixSession.cookieName] = this.wixSession.token;
    return this;
  };

  this.withRequestId = (id) => {
    this.headers['X-Wix-Request-Id'] = id;
    return this;
  };

  this.withUserAgent = (userAgent) => {
    this.headers['user-agent'] = userAgent;
    return this;
  };

  this.withIp = ip => {
    this.headers['x-wix-ip'] = ip;
    return this;
  };

  this.withPetri = () => {
    this.cookies._wixAB3 = chance.guid();
    return this;
  };

  this.options = () => {
    return {
      url: this.url,
      method: this.method,
      headers: _.merge(this.headers, {cookie: cookieUtils.toHeader(this.cookies)})
    };
  };

  return this;
}