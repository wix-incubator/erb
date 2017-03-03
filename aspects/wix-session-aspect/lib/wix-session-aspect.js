const {Aspect} = require('wix-aspects'),
  {errors} = require('wix-session-crypto'),
  log = require('wnp-debug')('wix-session-aspect'),
  assert = require('assert');

const cookieName = 'wixSession2';  
  
module.exports = {
  builder: v2 => {
    return data => new WixSessionAspect(data, v2);
  },
  errors: errors
};

class WixSessionAspect extends Aspect {
  constructor(data, decryptV2) {
    super('session', data);
    assert(decryptV2, `function to decrypt ${cookieName} cookie must be provided`);
    this._cookies = {};
    this._aspect = {};

    if (data && data.cookies) {
      let res = {};
      if (data.cookies[cookieName]) {
        res = aspectOrError(() => decryptV2(data.cookies[cookieName]));
        this._cookies[cookieName] = data.cookies[cookieName];
      }

      if (res.error) {
        this._error = res.error;
        log.error('failed populating session aspect with error:', this._error);
      } else if (res.aspect) {
        this._aspect = res.aspect;
      }
    }
  }

  get userGuid() {
    return this._aspect.userGuid;
  }

  get userName() {
    return this._aspect.userName;
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

  get error() {
    return this._error;
  }
}

function aspectOrError(fn) {
  try {
    const aspect = Object.freeze(fn());
    if (aspect.colors) {
      Object.freeze(aspect.colors);
    }
    return {aspect};
  } catch (error) {
    return {error};
  }
}
