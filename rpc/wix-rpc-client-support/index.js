const rpcSigner = require('./lib/request-hooks/rpc-request-signer'),
  wixSessionEnricher = require('./lib/request-hooks/wix-session'),
  biEnricher = require('./lib/request-hooks/bi'),
  gatekeeper = require('./lib/request-hooks/gatekeeper'),
  petriEnricher = require('./lib/request-hooks/petri'),
  callerIdEnricher = require('./lib/request-hooks/caller-id'),
  aspectsResponseHook = require('./lib/response-hooks/apply-on-aspects'),
  reqContext = require('./lib/request-hooks/web-context'),
  assert = require('assert');

module.exports.devSigningKey = 'testPassword';

module.exports.get = ({rpcSigningKey, callerIdInfo} = {}) => {
  assert(rpcSigningKey, 'rpcSigningKey is mandatory');

  return new WixRpcClientSupport(
    [
      reqContext.get(), 
      rpcSigner.get(rpcSigningKey), 
      wixSessionEnricher.get(),
      biEnricher.get(), 
      gatekeeper.get(), 
      petriEnricher.get(), 
      callerIdEnricher.get(callerIdInfo)
    ],
    [aspectsResponseHook.get()]
  );
};

function WixRpcClientSupport(requestHooks, responseHooks) {
  this.requestHooks = requestHooks;
  this.responseHooks = responseHooks;
}

WixRpcClientSupport.prototype.addTo = function () {
  Array.from(arguments).forEach(rpcFactory => {
    this.requestHooks.forEach(enrich => rpcFactory.registerBeforeRequestHook(enrich));
    this.responseHooks.forEach(extract => rpcFactory.registerAfterResponseHooks(extract));
  });
};
