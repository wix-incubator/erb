'use strict';
const Aspect = require('wix-aspects').Aspect,
  debug = require('wnp-debug')('wix-session-aspect'),
  assert = require('assert');

module.exports.builder = (v1, v2) => {
  return data => new WixSessionAspect(data, v1, v2);
};

class WixSessionAspect extends Aspect {
  constructor(data, decryptV1, decryptV2) {
    super('session', data);
    assert(decryptV1, 'function to decrypt wixSession cookie must be provided');
    assert(decryptV2, 'function to decrypt wixSession2 cookie must be provided');
    this._cookies = {};
    this._aspect = {};

    if (data && data.cookies) {
      if (data.cookies['wixSession2']) {
        this._aspect = getAspectIfAny(decryptV2, 'wixSession2', data.cookies);
      } else if (Object.keys(this._aspect).length === 0 && data.cookies['wixSession']) {
        this._aspect = getAspectIfAny(decryptV1, 'wixSession', data.cookies);
      }

      if (data.cookies['wixSession2'] || data.cookies['wixSession']) {
        if (data.cookies['wixSession2']) {
          this._cookies['wixSession2'] = data.cookies['wixSession2'];
        }
        if (data.cookies['wixSession']) {
          this._cookies['wixSession'] = data.cookies['wixSession'];
        }
        Object.freeze(this._cookies);
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

  get cookies() {
    return this._cookies;
  }
}

function getAspectIfAny(decrypt, cookieName, cookies) {
  let sessionObject = {};
  try {
    sessionObject = Object.freeze(decrypt(cookies[cookieName]));
    if (sessionObject.colors) {
      Object.freeze(sessionObject.colors);
    }
  } catch (err) {
    debug.error(`received malformed '${cookieName}' cookie, not populating session aspect`, err);
  }
  if (sessionObject && hasExpired(sessionObject)) {
    debug.error(`received expired '${cookieName}' cookie, not populating session aspect`);
    sessionObject = {};
  }
  return sessionObject;
}

function hasExpired(sessionJson) {
  if (sessionJson.expiration) {
    return sessionJson.expiration.getTime() < Date.now();
  } else {
    return true;
  }
}
