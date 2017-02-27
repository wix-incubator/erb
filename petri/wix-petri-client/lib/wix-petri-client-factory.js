'use strict';
const assert = require('assert'),
  WixPetriClient = require('./wix-petri-client'),
  mkLog = require('wnp-debug');

module.exports.factory = (rpcFactory, url, log = mkLog('wix-petri-client')) => {
  assert.ok(rpcFactory, 'rpcFactory is mandatory');
  assert.ok(url, 'url is mandatory');
  return new PetriClientFactory(rpcFactory, url, log);
};

function buildUrl(baseUrl, serviceName) {
  let resultUrl = baseUrl.trim();
  resultUrl = resultUrl.endsWith('/') ? resultUrl : resultUrl + '/';
  return resultUrl + serviceName;
}

class PetriClientFactory {
  
  constructor(rpcFactory, url, log) {
    this.rpcFactory = rpcFactory;
    this.log = log;
    this.url = url;
  }

  client(aspects) {
    assert.ok(aspects, 'aspects must be provided');
    const laboratoryClientFactory = this.rpcFactory.clientFactory(buildUrl(this.url, 'LaboratoryApi'));
    return new WixPetriClient(
      laboratoryClientFactory.client(aspects), 
      this.log);
  }
}
