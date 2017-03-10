const log = require('wnp-debug')('wix-rpc-client-support');

module.exports.get = () => (headers, body, context) => {
  const petriContext = context && context['petri'];
  if (!petriContext) {
    log.error('petri aspect not provided.');
    return;
  }

  const cookies = petriContext.cookies || {};
  const overrides = petriContext.overrides || {};

  Object.keys(cookies).forEach(key => {
    if (key.indexOf('|') === -1) {
      headers['X-Wix-Petri-Anon-RPC'] = cookies[key];
    }
    else {
      var headerName = 'X-Wix-Petri-Users-RPC-' + key.split('|')[1];
      headers[headerName] = cookies[key];
    }
  });

  let overridesArr = [];
  Object.keys(overrides).forEach(key => {
    overridesArr.push(`${key}:${overrides[key]}`);
  });

  if (overridesArr.length) {
    headers['x-wix-petri-ex'] = overridesArr.join(';');
  }
};
