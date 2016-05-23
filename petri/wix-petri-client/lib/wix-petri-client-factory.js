'use strict';
const assert = require('assert'),
  WixPetriClient = require('./wix-petri-client');

module.exports.factory = (rpcFactory, url) => {
  assert.ok(rpcFactory, 'rpcFactory is mandatory');
  assert.ok(url, 'url is mandatory');

  return new PetriClientFactory(rpcFactory.clientFactory(buildUrl(url)));
};

function buildUrl(url) {
  let resultUrl = url.trim();
  resultUrl = resultUrl.endsWith('/') ? resultUrl : resultUrl + '/';
  return resultUrl + 'LaboratoryApi';
}

class PetriClientFactory {
  constructor(rpcClientFactory) {
    this.rpcClientFactory = rpcClientFactory;
  }

  client(aspects) {
    assert.ok(aspects, 'aspects must be provided');
    return new WixPetriClient(this.rpcClientFactory.client(aspects));
  }
}