'use strict';
const jwtCrypto = require('wnp-jwt-crypto'),
  assert = require('assert'),
  errors = require('./errors'),
  assertExpired = require('./assert-expired');

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

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCluCjsUovfGOA
D5irdFCBcoDzJYayApAjrFQNna0N6SIyvk/KlMZ50lJTOSpzd0PjvYws9kmhY/P
G1V8m7NgOVddPLIbsaz7BbassldIkeopzq09Xg80Hd0hXG/O2Y4hlZri/xxtgtD
uM769PuME4zWIHJW+vAjuCOZImHny9YsIjLhxk7B8DgXXaRCmX6zf8bh2BiO6F/
qG2OZcFbYz7HSYoEt5bhTtgUqx1iwTNMUePy7Srj64UqM3AIPNiXnJZb512jvbV
yujmRt8fYd9WPRuZMWI/iwTYHQGlzLtP3aTuTaGVRK7ff3KX03Ba6SqlF8ob0Wg
6Z5lMTDP4v/MkLAgMBAAECggEABSVRx/zMMRJBqn1UKWc9lgK3wH0S8S+mwz30z
BpNjxd/ntgWOcDvrakLcdhpRI3/nNdTewb3zIOWMc5XCkQkGlj9SZpzh+KZFE2d
nz0eIOBlxPjs9D45dlzWpkYmTo/+v4UkIfrNraB/t9Wb0BKZ6wg9h3YePO1y1Zk
TmC1+N9++pA6NZ2thlbYg1+THOSnsLVdpV7ZA+4GfqEmGLALyxpNgV0yqLCK5xI
6+G7TpQfTAxs8pO4VHFQNsA5iKHQM8B3OCjRsTRF2Mwjope7U41HrTeJR/joJgh
LpueGiKTiQq76gWfpMpucZ5wFKtWeJ8WYACUsfJlzW02i+VdWP3yQKBgQDTGdoP
sWFgoCCTTmwx5p5BNwwO61l+7N8Yd6djf4p+Xw8N/+mGMwRdBwQMVFKkOvaERd1
jsgc17i+9ghY6XaO63Cy8gniXPHYfWBWgGeMM7fPBr+Pa8ZqouSUoihRS4IsbuZ
+0iMghev0VcTS1fGMQ2zbgS0Qo0rWNHkFFi9rufwKBgQDI91gQtjWo82k5jiULd
AbQejvUZ7ZlRtqL0om5n9NeeE/BP62Mvke5qlVW8Z8fH7JVipnGGk2nIYiJgu+u
QltaN7RW1NTb3FfWUmz6mWHEhC7LHghAU2hXUwTWILSEhqSf74tIKSvSJ/YkWla
IS2K5ACL0Lcn+j4zZmCc4tQ+3dQKBgQDDuTVX1XNenjh1u4FPJu5Vss8ISic5Ki
+SxOW6t7bVghc4OKzwkv6ZrfaP4+KXiF+ltg0U8SwEUamLwEARr14t0xPbV/Cs8
A7o8sdiIH5GL50QWJ8fEWD+zGJqWtOLH8t6UjmDrko32IssRUDEf+Zt64HOpZo1
a1+Ozp1f+NJsywKBgCZvV8JqdrzHQNqnGuKj4CHDHuoyo6me8XFIZNrBfHVW4Tn
+aby/L4yMzSGBuIMFVuART/OZWDycpzZVem2Dd2E7whvRPJyH+ayduwX6i74/4Y
srRTy4Nv5sfEJPovatoZKNB8BXT3A0AFlXhbEvacQkCItWrokm/zMmbGnmBwl5A
oGBAK+CHeC1D+D+uQgmhFF4SHZZ7T8TMihtmHCzf5tUWByKozD7OE9hrW0Pxw/o
SidmVgVV/O9cyrjvwH0h6uezaeA98sVuqpomlcKqax/MBNASmsl4Vs7ouu5yjPY
3SviV1nK3G3SYiz/va02PnAmXqf1W2u7bjoIAbZCrueKWr8OO
-----END PRIVATE KEY-----
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
module.exports.privateKey = privateKey;
module.exports.get = pubKey => new WixSessionCrypto(pubKey);

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
        throw new errors.SessionExpiredError('token expired', e.expiredAt);
      } else {
        throw new errors.SessionMalformedError(e.message);
      }
    }

    const normalized = WixSessionCrypto._stripAndNormalize(decoded);
    assertExpired(normalized.expiration);
    return normalized;
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