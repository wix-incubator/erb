'use strict';
const sessionCrypto = require('wix-session-crypto');

module.exports = (sessionKey, session2Key) => {
  return {
    v1: sessionCrypto.v1.get(sessionKey),
    v2: sessionCrypto.v2.get(session2Key)
  };
};
