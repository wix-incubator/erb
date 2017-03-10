const _ = require('lodash'),
  rpcSigner = require('./request-hooks/rpc-request-signer'),
  wixSessionEnricher = require('./request-hooks/wix-session'),
  biEnricher = require('./request-hooks/bi'),
  petriEnricher = require('./request-hooks/petri'),
  callerIdEnricher = require('./request-hooks/caller-id'),
  aspectsResponseHook = require('./response-hooks/apply-on-aspects'),
  reqContext = require('./request-hooks/web-context'),
  assert = require('assert');

module.exports.devSigningKey = 'testPassword';

module.exports.get = options => {
  const opts = options || {};
  assert(opts.rpcSigningKey, 'rpcSigningKey is mandatory');

  return new WixRpcClientSupport(
    [reqContext.get(), rpcSigner.get(options.rpcSigningKey), wixSessionEnricher.get(),
      biEnricher.get(), petriEnricher.get(), callerIdEnricher.get(options.callerIdInfo)],
    [aspectsResponseHook.get()]
  );
};

function WixRpcClientSupport(requestHooks, responseHooks) {
  this.requestHooks = requestHooks;
  this.responseHooks = responseHooks;
}

WixRpcClientSupport.prototype.addTo = function () {
  _.slice(arguments).forEach(rpcFactory => {
    this.requestHooks.forEach(enrich => rpcFactory.registerBeforeRequestHook(enrich));
    this.responseHooks.forEach(extract => rpcFactory.registerAfterResponseHooks(extract));
  });
};
