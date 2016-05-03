# wnp-bootstrap-rpc

[wix-bootstrap](../wix-bootstrap) plugin that adds `rpc` to a `context` where `rpc` is a preconfigured instance of [wix-json-rpc-client](../../rpc/wix-json-rpc-client). 

This plugin can be added to [wix-bootstrap](../wix-bootstrap) via `use`. It has no extra dependencies.

## development/production modes

This module detects run mode (NODE_ENV) and depending on:
 - development - does not load config, but instead uses preconfigured session key from [wix-rpc-client-support](../../rpc/wix-rpc-client-support).devSigningKey
 - production - loads keys from config (see `./templates`). 

Module supports config overrides via environment variables. Given environment variables are provided, config will not be loaded. Environment variables:
 - WIX-BOOT-RPC-SIGNING-KEY

## install

```bash
npm install --save wnp-bootstrap-rpc 
```

## usage

Given you are developing a `bootstrap`-based app, you can access `rpc` within your bootstrap config file:

**index.js**

```js
const bootstrap = require('wix-bootstrap');

bootstrap()
  .use(require('wix-bootstrap-rpc'))  
  .config('./lib/config')
  .express('./lib/express-app')
  .start();
```

**lib/config.js**

```js
module.exports = context => {
  const config = context.config.load('my-config-name'); 

  return {
    metasiteRpc: context.rpc.clientFactory(config.rpc.metasite, 'ServiceName')
  };
};
```

**lib/express-express-app.js**

```js
const express = require('express');

module.exports = config => {
  const app = new express.Router();
  
  app.get('/test', (req, res, next) => {
    const metasiteRpcClient = config.metasiteRpc.client(req.aspects);
    metasiteRpcClient.invoke('someMethod')
      .then(rpcResponse => res.json(rpcResponse))
      .catch(next);
  });

  return app;
};
```

## api

Can be plugged into `wix-bootstrap` with additional options:
 - opts: object, optional
  - timeout: timeout in milliseconds for rpc request.

```js
...
bootstrap()
  .use(require('wix-bootstrap-rpc'), {timeout: 10000})
...
```

Is added with key `rpc` onto `context`, where `rpc` is an instance of preconfigured [wix-json-rpc-client](../../rpc/wix-json-rpc-client).factory();