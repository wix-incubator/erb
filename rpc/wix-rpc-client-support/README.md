# wix-rpc-client-support

Module that adapts [wix-json-rpc-client](../wix-json-rpc-client) to work with wix rpc services (jvm-based). It does following things, but not limited to:
 - signs request;
 - transfers client request headers onto rpc request, ex `x-wix-request-id`...;
 - transfers petri cookie headers onto rpc request.
 - ...
 
It depends on other middlewares, mostly from [aspects](../../aspects/).

## install

```
npm install --save wix-rpc-client-support
```

## usage

```js
const express = require('express'),
  wixExpressAspects = require('wix-express-aspects'),
  biAspect = require('wix-bi-aspect'),
  petriAspect = require('wix-petri-aspect'),
  webContextAspect = require('wix-web-context-aspect'),
  wixSessionAspect = require('wix-session-aspect'),
  wixRpcClientSupport = require('wix-rpc-client-support');
  rpcClient = require('wix-json-rpc-client');

const app = express();

app.use(wixExpressAspects.get([
  biAspect.builder(),
  petriAspect.builder(),
  webContextAspect.builder(...),
  wixSessionAspect.builder(...)]));

// get factory
const rpcFactory = rpcClient.factory();
wixRpcClientSupport.get({rpcSigningKey: '123456789'}).addTo(rpcFactory);

// get client
const client = rpcFactory.clientFactory('http://localhost:3000/rpcService');

app.get('/', (req, res, next) => {
  client.client(req.aspects)
    .invoke('method', 'param1', 'param2')
    .then(resp => res.end(resp))
    .catch(next);
});

app.listen(3000);
```

## Api
### get(opts): WixRpcClientSupport
Returns new instance of `WixRpcClientSupport`.

Parameters:
 - opts: object, mandatory;
   - rpcSigningKey: string, mandatory - key used to sign rpc requests;

### WixRpcClientSupport.addTo(rpcFactories)
Attaches rpc request enrichment hooks to provided rpc factories.

Arguments:
 - rpcFactories: varargs of `RpcClientFactory` instances.

### WixRpcClientSupport.devSigningKey
Signing key used in dev setup and matches one hardcoded by jvm rpc artifacts.
