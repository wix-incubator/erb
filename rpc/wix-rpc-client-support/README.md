# wix-rpc-client-support

Module that adapts [json-rpc-client](../json-rpc-client) to work with wix rpc services (jvm-based). It does following things, but not limited to:
 - signs request;
 - transfers client request headers onto rpc request, ex `x-wix-request-id`...;
 - transfers petri cookie headers onto rpc request.
 - ...
 
It depends on other middlewares, mostly from [aspects](../../aspects/)  

## install

```
npm install --save wix-rpc-client-support
```
 
## usage

```js
const express = require('express'),
  wixExpressDomain = require('wix-express-domain'),
  wixExpressReqContext = require('wix-express-req-context'),
  wixRpcClientSupport = require('wix-rpc-client-support');
  rpcClient = require('json-rpc-client'),
  hmacSigner = require('wix-hmac-signer');

const app = express();
app.use(wixExpressDomain);
app.use(wixExpressReqContext);//other aspect middlewares should be wired in as well

// get factory
const rpcFactory = rpcClient.factory();

const rpcSigningKey = '123456789'; 

// attach support hooks
wixRpcClientSupport(HmacSigner.get(rpcSigningKey)).addSupportToRpcClients(rpcFactory);

// get client
const client = rpcFactory.client('http://localhost:3000/rpcService');

app.get('/', (req, res) => {
  client.invoke('foo', 'bar', 'baz').then((resp) => res.end(resp));//now you have json request will all the goodies.
});

app.listen(3000);
```

## Api

### get(options)
Returns new instance of `WixRpcClientSupport`.

Parameters:
 - options: object with keys:
  - rpcSigningKey - key used to sign rpc request.

### WixRpcClientSupport.addTo(rpcFactories)
Attaches rpc request enrichment hooks to provided rpc factories.

Arguments:
 - rpcFactories: varargs of `RpcClientFactory` instances.
