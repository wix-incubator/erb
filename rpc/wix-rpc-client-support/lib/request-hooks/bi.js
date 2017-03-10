const log = require('wnp-debug')('wix-rpc-client-support');

module.exports.get = () => (headers, body, context) => {
  const biContext = context && context['bi'];

  if (!biContext) {
    log.error('bi aspect not provided.');
    return;
  }

  if (biContext.globalSessionId) {
    headers['X-Wix-Client-Global-Session-Id'] = biContext.globalSessionId;
  }

  if (biContext.clientId) {
    headers['X-Wix-Client-Id'] = biContext.clientId;
  }
};
