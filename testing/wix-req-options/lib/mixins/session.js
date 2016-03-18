'use strict';
const testkit = require('wix-session-crypto-testkit');

module.exports.addTo = function(to) {
  to.withSession = function(opts) {
    if (!this.wixSession) {
      this.wixSession = testkit.aValidBundle(opts);
    }
    this.cookies[this.wixSession.cookieName] = this.wixSession.token;
    return this;
  };
};