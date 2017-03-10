const log = require('wnp-debug')('wix-rpc-client-support');

module.exports.get = () => (headers, body, context) => {
  const session = context && context['session'];

  if (!session) {
    log.error('session aspect not provided.');
    return;
  }

  if (session.cookies && session.cookies['wixSession']) {
    headers['X-Wix-Session'] = session.cookies['wixSession'];
  }

  if (session.cookies && session.cookies['wixSession2']) {
    headers['X-Wix-Session2'] = session.cookies['wixSession2'];
  }

};
