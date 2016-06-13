'use strict';
const testkit = require('wix-session-crypto-testkit').v1;

module.exports.addTo = function(to) {
  to.withSession = function(bundle) {
    this.wixSession = bundle || testkit.aValidBundle();
    this.cookies[this.wixSession.cookieName] = this.wixSession.token;
    return this;
  };
};