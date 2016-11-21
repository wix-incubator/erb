'use strict';
const testkit = require('wix-session-crypto-testkit').v2;

module.exports.addTo = function(to) {
  to.withSession = function(bundle) {
    this.wixSession = bundle || testkit.aValidBundle();
    this.cookies[this.wixSession.cookieName] = this.wixSession.token;
    return this;
  };
};
