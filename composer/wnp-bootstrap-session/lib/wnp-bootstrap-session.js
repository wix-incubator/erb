'use strict';
const sessionCrypto = require('wix-session-crypto').v1;

module.exports = (mainKey, alternateKey) => sessionCrypto.get(mainKey, alternateKey);
