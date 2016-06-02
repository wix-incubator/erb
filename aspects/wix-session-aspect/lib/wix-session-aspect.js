'use strict';
const Aspect = require('wix-aspects').Aspect,
  wixSessionCrypto = require('wix-session-crypto').v1,
  debug = require('wnp-debug')('wix-session-aspect');

//TODO: deprecate builder with mainKey/alternateKey
module.exports.builder = mainKey => {
  let crypto;
  if (mainKey instanceof Object) {
    crypto = mainKey;
  } else {
    crypto = wixSessionCrypto.get(mainKey);
  }
  return data => new WixSessionAspect(data, crypto);
};

class WixSessionAspect extends Aspect {
  constructor(data, crypto) {
    super('session', data);
    if (data && data.cookies && data.cookies['wixSession']) {
      let sessionObject;
      try {
        sessionObject = crypto.decrypt(data.cookies['wixSession']);
      } catch (err) {
        debug.error('received malformed \'wixSession\' cookie, not populating session aspect');
      }
      if (sessionObject && this._hasExpired(sessionObject)) {
        debug.error('received expired \'wixSession\' cookie, not populating session aspect');
      } else if (sessionObject) {
        this._aspect = sessionObject;
        if (this._aspect.colors) {
          Object.freeze(this._aspect.colors);
        }
        this._cookie = Object.freeze({
          name: 'wixSession',
          value: data.cookies['wixSession']
        });
      }
    }
  }

  get userGuid() {
    return this._aspect.userGuid;
  }

  get isWixStaff() {
    return this._aspect.wixStaff;
  }

  get userCreationDate() {
    return this._aspect.userCreationDate;
  }

  get expiration() {
    return this._aspect.expiration;
  }

  get colors() {
    return this._aspect.colors;
  }

  get cookie() {
    return this._cookie;
  }

  _hasExpired(sessionJson) {
    if (sessionJson.expiration) {
      return sessionJson.expiration.getTime() < Date.now();
    } else {
      return true;
    }
  }
}