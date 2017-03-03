const {WixSessionCrypto} = require('wix-session-crypto'),
  loadConfiguration = require('./lib/load-configuration');

module.exports = ({env, config, log}) => {
  const sessionKey = loadConfiguration({env, config, log});
  return new WixSessionCrypto(sessionKey);
};
