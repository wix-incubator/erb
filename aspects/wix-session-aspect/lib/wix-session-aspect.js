'use strict';
const Aspect = require('wix-aspects').Aspect,
  wixSessionCrypto = require('wix-session-crypto');

module.exports.builder = (mainKey, alternateKey) => {
  let crypto = wixSessionCrypto.get(mainKey, alternateKey);
  return data => new WixSessionAspect(data, crypto);
};

class WixSessionAspect extends Aspect {
  constructor(data, crypto) {
    super('session', data);
    if (data && data.cookies && data.cookies['wixSession']) {
      const sessionObject = crypto.decrypt(data.cookies['wixSession']);
      if (!this._hasExpired(sessionObject)) {
        this._aspect = crypto.decrypt(data.cookies['wixSession']);
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

  get uid() {
    return this._aspect.uid;
  }

  get mailStatus() {
    return this._aspect.mailStatus;
  }

  get isWixStaff() {
    return this._aspect.isWixStaff;
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

  get permissions() {
    return this._aspect.permissions;
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