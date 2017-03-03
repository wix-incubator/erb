const jwtCrypto = require('wnp-jwt-crypto'),
  assert = require('assert'),
  {SessionExpiredError, SessionMalformedError} = require('./errors'),
  assertExpired = require('./assert-expired');

const fieldTransforms = {
  userGuid: {key: 'userGuid', fn: el => el},
  userName: {key: 'userName', fn: el => el},
  wxexp: {key: 'expiration', fn: el => new Date(el)},
  ucd: {key: 'userCreationDate', fn: el => new Date(el)},
  wxs: {key: 'wixStaff', fn: el => el},
  rmb: {key: 'remembered', fn: el => el}
};

class WixSessionCrypto {
  constructor(pubKey) {
    assert(pubKey, 'pubKey is mandatory');
    this.opts = {publicKey: normalizeKey(pubKey)};
  }

  decrypt(token) {
    let decoded = {};
    try {
      decoded = JSON.parse(jwtCrypto.decrypt(token.substring(4), this.opts).data);
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new SessionExpiredError('token expired', e.expiredAt);
      } else {
        throw new SessionMalformedError(e.message);
      }
    }

    const normalized = stripAndNormalize(decoded);
    assertExpired(normalized.expiration);
    return normalized;
  }
}

function stripAndNormalize(sessionObject) {
  const transformed = {};
  Object.keys(fieldTransforms).forEach(key => {
    if (sessionObject[key] !== undefined) {
      const transformer = fieldTransforms[key];
      transformed[transformer.key] = transformer.fn(sessionObject[key]);
    }
  });
  return transformed;
}


function normalizeKey(key) {
  if (key.startsWith('-----BEGIN')) {
    return key;
  } else {
    return `-----BEGIN PUBLIC KEY-----\n${key.match(/.{1,65}/g).join('\n')}\n-----END PUBLIC KEY-----\n`
  }
}

module.exports = WixSessionCrypto;
