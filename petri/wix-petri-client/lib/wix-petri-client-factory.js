'use strict';
const assert = require('assert'),
  WixPetriClient = require('./wix-petri-client'),
  mkLog = require('wnp-debug');

module.exports.factory = (rpcFactory, url, log = mkLog('wix-petri-client')) => {
  assert.ok(rpcFactory, 'rpcFactory is mandatory');
  assert.ok(url, 'url is mandatory');

  return new PetriClientFactory(rpcFactory.clientFactory(buildUrl(url)), log);
};

function buildUrl(url) {
  let resultUrl = url.trim();
  resultUrl = resultUrl.endsWith('/') ? resultUrl : resultUrl + '/';
  return resultUrl + 'LaboratoryApi';
}

class PetriClientFactory {
  constructor(rpcClientFactory, log) {
    this.rpcClientFactory = rpcClientFactory;
    this.log = log;
  }

  client(aspects) {
    assert.ok(aspects, 'aspects must be provided');
    return new WixPetriClient(this.rpcClientFactory.client(aspects), this.log);
  }
}
