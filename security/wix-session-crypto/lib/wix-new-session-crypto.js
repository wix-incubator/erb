'use strict';
const jwtCrypto = require('wnp-jwt-crypto'),
  assert = require('assert');

const devKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApbgo7FKL3xjgA+Yq3RQ
gXKA8yWGsgKQI6xUDZ2tDekiMr5PypTGedJSUzkqc3dD472MLPZJoWPzxtVfJuz
YDlXXTyyG7Gs+wW2rLJXSJHqKc6tPV4PNB3dIVxvztmOIZWa4v8cbYLQ7jO+vT7
jBOM1iByVvrwI7gjmSJh58vWLCIy4cZOwfA4F12kQpl+s3/G4dgYjuhf6htjmXB
W2M+x0mKBLeW4U7YFKsdYsEzTFHj8u0q4+uFKjNwCDzYl5yWW+ddo721cro5kbf
H2HfVj0bmTFiP4sE2B0Bpcy7T92k7k2hlUSu339yl9NwWukqpRfKG9FoOmeZTEw
z+L/zJCwIDAQAB
-----END PUBLIC KEY-----
`;

const fieldTransforms = {
  userGuid: {key: 'userGuid', fn: el => el},
  userName: {key: 'userName', fn: el => el},
  wxexp: {key: 'expiration', fn: el => new Date(el)},
  ucd: {key: 'userCreationDate', fn: el => new Date(el)},
  wxs: {key: 'wixStaff', fn: el => el},
  rmb: {key: 'remembered', fn : el => el}
};

module.exports.devKey = devKey;
module.exports.get = pubKey => new WixSessionCrypto(pubKey);

class WixSessionCrypto {
  constructor(pubKey) {
    assert(pubKey, 'pubKey is mandatory');
    this.opts = {publicKey: normalizeKey(pubKey), ignoreExpiration: true};
  }

  decrypt(token) {
    const decoded = JSON.parse(jwtCrypto.decrypt(token.substring(4), this.opts).data);
    return WixSessionCrypto._stripAndNormalize(decoded);
  }

  static _stripAndNormalize(sessionObject) {
    const transformed = {};
    Object.keys(fieldTransforms).forEach(key => {
      if (sessionObject[key] !== undefined) {
        const transformer = fieldTransforms[key];
        transformed[transformer.key] = transformer.fn(sessionObject[key]);
      }
    });
    return transformed;
  }

}

function normalizeKey(key) {
  if (key.startsWith('-----BEGIN')) {
    return key;
  } else {
    return `-----BEGIN PUBLIC KEY-----\n${key.match(/.{1,65}/g).join('\n')}\n-----END PUBLIC KEY-----\n`
  }
}