'use strict';
const log = require('wix-logger').get('wix-rpc-client-support');

module.exports.get = () => (headers, body, context) => {
  const session = context && context['session'];

  if (!session) {
    log.error('session aspect not provided.');
    return;
  }

  if (session.cookie) {
    headers['X-Wix-Session'] = session.cookie.value;
  }
};
