const assert = require('assert'),
  WixGatekeeperClient = require('./wix-gatekeeper-client');

module.exports.factory = (rpcFactory, url) => {
  assert.ok(rpcFactory, 'rpcFactory is mandatory');
  assert.ok(url, 'url is mandatory');

  return new GatekeeperClientFactory(rpcFactory.clientFactory(buildUrl(url)));
};

function buildUrl(url) {
  let resultUrl = url.trim();
  resultUrl = resultUrl.endsWith('/') ? resultUrl : resultUrl + '/';
  return resultUrl + 'GatekeeperService';
}

class GatekeeperClientFactory {
  constructor(rpcClientFactory) {
    this._rpcClientFactory = rpcClientFactory;
  }

  client(aspects) {
    assert.ok(aspects, 'aspects must be provided');
    return new WixGatekeeperClient(this._rpcClientFactory.client(aspects));
  }
}
