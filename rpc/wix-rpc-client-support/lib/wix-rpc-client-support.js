'use strict';
const _ = require('lodash'),
  rpcSigner = require('./enrichers/rpc-request-signer'),
  wixSessionEnricher = require('./enrichers/wix-session-enricher'),
  biEnricher = require('./enrichers/bi-enricher'),
  wixSession = require('wix-session'),
  wixRequestContext = require('wix-req-context'),
  wixBi = require('wix-bi'),
  reqContext = require('./enrichers/req-context-enricher');

module.exports.get = options => {
  const opts = options || {};

  if (_.isEmpty(opts.rpcSigningKey)) {
    throw new Error('rpcSigningKey is mandatory');
  }

  // todo - add petri enricher
  return new WixRpcClientSupport(
    reqContext.get(wixRequestContext),
    rpcSigner.get(options.rpcSigningKey),
    wixSessionEnricher.get(wixSession),
    biEnricher.get(wixBi)
  );
};

function WixRpcClientSupport() {
  this.enrichers = _.slice(arguments);
}

WixRpcClientSupport.prototype.addTo = function (rpcFactories) {
  _.slice(arguments).forEach(rpcFactory => {
    this.enrichers.forEach(enrich => {
      rpcFactory.registerHeaderBuildingHook((headers, jsonBuffer) => enrich(headers, jsonBuffer));
    });
  });
};