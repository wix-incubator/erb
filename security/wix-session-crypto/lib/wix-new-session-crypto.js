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
  userGuid: el => el,
  userName: el => el,
  expiration: el => new Date(el),
  userCreationDate: el => new Date(el),
  wixStaff: el => el,
  remembered: el => el
};

module.exports.devKey = devKey;
module.exports.get = pubKey => new WixSessionCrypto(pubKey);

class WixSessionCrypto {
  constructor(pubKey) {
    assert(pubKey, 'pubKey is mandatory');
    this.opts = {publicKey: pubKey, ignoreExpiration: true};
  }

  decrypt(token) {
    const decoded = JSON.parse(jwtCrypto.decrypt(token.substring(4), this.opts).data);
    return WixSessionCrypto._stripAndNormalize(decoded);
  }

  static _stripAndNormalize(sessionObject) {
    const transformed = {};
    Object.keys(fieldTransforms).forEach(key => {
      if (sessionObject[key] !== undefined) {
        transformed[key] = fieldTransforms[key](sessionObject[key]);
      }
    });
    return transformed;
  }

}