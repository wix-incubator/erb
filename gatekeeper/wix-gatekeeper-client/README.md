# wix-gatekeeper-client

Wix gatekeeper client intended to authorize users. It's a thin client that uses Wix RPC to make remote calls against [gatekeeper](https://github.com/wix-private/authorization/tree/master/gatekeeper-server). 

It depends on:
 - fully configured [wix-json-rpc-client](../rpc/wix-json-rpc-client) with needed aspects hooked-up;
 - [wix-gatekeeper-server](https://github.com/wix-private/authorization/tree/master/gatekeeper-server) url.

## install

```bash
npm install --save wix-gatekeeper-client
```

## usage

```js
//... rpcFactory needs to be set up
const gatekeeper = require('wix-gatekeeper-client').factory(rpcFactory, 'http://gatekeeper:3000'),
    express = require('express');

//authorize
express.get('/', (req, res) => {
    gatekeeper.client(req.aspects)
      .authorize('aMetasiteId', {scope: 'permissionScope', action: 'permissionAction'})
      .then(() => res.end()) // user is authorized, returns status 200
      .catch(e => {
        if (e.name === 'GatekeeperAccessDenied') {
          res.status(401).end(); // user is unauthorized, returns status 401
        } else {
          res.status(500).end(); // transport exception occured, returns status 500
        }
      });
});
```

## Api
## factory(rpcFactory, url): WixGatekeeperClientFactory
Creates a new instance of `WixGatekeeperClientFactory`.

Parameters:
 - rpcFactory - preconfigured instance of [wix-json-rpc-client](../rpc/wix-json-rpc-client) to be used.
 - url - url of gatekeeper server (http://host:port/wix-gatekeeper-server) as would be injected by deployment system.

## WixGatekeeperClientFactory.client(aspects): WixGatekeeperClient
Creates an instance of `WixGatekeeperClient` bound to provided `aspects`.

Parameters:
 - aspects - see [aspects](../../aspects).

## WixGatekeeperClient.authorize(metasiteId, {scope: permissionScope, action: permissionAction}): Promise(nothing|error)
Tries pto authorize user and returns a Promise, which contains no value if user was authorized, 
or an exception if authorization failed for some reason. Notable exception: GatekeeperAccessDenied - thrown
by GatekeeperService when it fails to authorize given user. Other exceptions mean technical problems
that occurred during authorization attempt.

Parameters:
 - metasiteId
 - permission.scope - product, which given action is associated with
 - permission.action - action which user is trying to perform

## errors.GatekeeperAccessDeniedException
An exception, which is returned when Gatekeeper fails to authorize the user.
