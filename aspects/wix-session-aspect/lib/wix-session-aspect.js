'use strict';
const Aspect = require('wix-aspects').Aspect,
  log = require('wnp-debug')('wix-session-aspect'),
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

    const results = new CookieAspectHandler();

    if (data && data.cookies) {
      if (!results.isOk() && data.cookies['wixSession2']) {
        results.pushAspectOrError(() => maybeGetAspect(decryptV2, 'wixSession2', data.cookies));
      }
      if (!results.isOk() && data.cookies['wixSession']) {
        results.pushAspectOrError(() => maybeGetAspect(decryptV1, 'wixSession', data.cookies));
      }

      if (results.isOk()) {
        this._aspect = results.aspect;
        results.logDebugIfAny();
      } else if (data.cookies['wixSession2'] || data.cookies['wixSession']) {
        results.logError();
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

function maybeGetAspect(decrypt, cookieName, cookies) {
  let sessionObject = {};
  try {
    sessionObject = Object.freeze(decrypt(cookies[cookieName]));
    if (sessionObject.colors) {
      Object.freeze(sessionObject.colors);
    }
  } catch (err) {
    throw new SessionMalformedError(`received malformed '${cookieName}' cookie '${cookies[cookieName]}'`);
  }

  if (hasExpired(sessionObject)) {
    throw new SessionExpiredError(`received expired '${cookieName}' cookie '${cookies[cookieName]}' with expiration '${sessionObject.expiration}'`);
  }
  return sessionObject;
}

class SessionExpiredError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class SessionMalformedError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

function hasExpired(sessionJson) {
  if (sessionJson.expiration) {
    return sessionJson.expiration.getTime() < Date.now();
  } else {
    return false;
  }
}

class CookieAspectHandler {
  constructor() {
    this._errors = [];
  }

  pushAspectOrError(aspectOrError) {
    try {
      this._aspect = aspectOrError();
    } catch (e) {
      this._errors.push(e);
    }
  }

  isOk() {
    return this._aspect;
  }

  get aspect() {
    return this._aspect;
  }

  logError() {
    log.error(`failed populating session aspect with errors: [${this._errors.join(', ')}]`);
  }

  logDebugIfAny() {
    if (this._errors.length > 0) {
      log.debug(`session aspect populated, but encountered errors: [${this._errors.join(', ')}]`);
    }
  }
}