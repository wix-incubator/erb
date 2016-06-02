'use strict';
const testkit = require('wix-session-crypto-testkit');

module.exports.addTo = function(to) {
  to.withSession = function(bundle) {
    if (!this.wixSession) {
      this.wixSession = bundle || testkit.aValidBundle();
    }
    this.cookies[this.wixSession.cookieName] = this.wixSession.token;
    return this;
  };
};