'use strict';
const sessionCrypto = require('wix-session-crypto');

module.exports = (mainKey, alternateKey) => sessionCrypto.get(mainKey, alternateKey);
