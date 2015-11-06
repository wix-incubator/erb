'use strict';
const _ = require('lodash'),
  rpcSigner = require('./enrichers/rpc-request-signer'),
  reqContext = require('./enrichers/req-context');

module.exports.get = (options) => {
  const opts = options || {};

  if (_.isEmpty(opts.rpcSigningKey)) {
    throw new Error('rpcSigningKey is mandatory');
  }

  return new WixRpcClientSupport(
    rpcSigner.get(options.rpcSigningKey),
    reqContext.get()
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