const defaultLog = require('wnp-debug')('wix-rpc-client-support');

module.exports.get = (log = defaultLog) => (headers, body, context) => {
  
  const gatekeeperContext = context && context['gatekeeper'];
  
  if (gatekeeperContext) {
    headers['X-Wix-Auth-AlreadyVerified'] = gatekeeperContext.authorized.toString();

    if (gatekeeperContext.authorized) {
      headers['X-Wix-Auth-Ctx'] = JSON.stringify(gatekeeperContext.context);
    }
  } else {
    log.error('gatekeeper aspect not provided.');
  }
};
