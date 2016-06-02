'use strict';
const wixSessionCrypto = require('wix-session-crypto').v2,
  crypto = require('wnp-jwt-crypto'),
  chance = require('chance')();

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

module.exports.aValidBundle = opts => aBundle(opts);
module.exports.anExpiredBundle = opts => {
  const expired = {session: {expiration: new Date(new Date().getTime() - 60)}};
  return aBundle(Object.assign({}, opts, expired));
};

function aBundle(opts) {
  const options = opts || {};
  const originalSession = aSession(options.session || {});
  const publicKey = options.publicKey || wixSessionCrypto.devKey;
  const privKey = options.privateKey || privateKey;
  const token = encrypt(originalSession, privKey);
  const session = wixSessionCrypto.get(publicKey).decrypt(token);
  return {
    publicKey: publicKey,
    privateKey: privKey,
    session,
    sessionJson: JSON.parse(JSON.stringify(session)),
    token,
    cookieName: 'wixSession2'
  };
}

function encrypt(session, privateKey) {
  return 'JWT.' + crypto.encrypt({data: JSON.stringify(session)}, {privateKey});

}

function aSession(overrides) {
  return Object.assign({}, {
    colors: [],
    emailWithWixDomain: false,
    expiration: new Date(Date.now() + 60*60*24*1000),
    lastAuthTime: chance.date(),
    lastValidationTime: chance.date(),
    remembered: chance.bool(),
    sessionCreationDate: chance.date(),
    userCreationDate: chance.date(),
    userGuid: chance.guid(),
    userName: chance.word(),
    wixStaff: chance.bool()
  }, overrides);
}