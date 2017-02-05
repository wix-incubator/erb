const sessionCrypto = require('wix-session-crypto'),
  loadConfiguration = require('./lib/load-configuration');

module.exports = load;  
  
function load({env, config, log}) {
  const {sessionKey, session2Key} = loadConfiguration({env, config, log});
  return {
    v1: sessionCrypto.v1.get(sessionKey),
    v2: sessionCrypto.v2.get(session2Key)
  };
}
