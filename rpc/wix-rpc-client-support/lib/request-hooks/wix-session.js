'use strict';
const log = require('wnp-debug')('wix-rpc-client-support');

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
