# wix-bootstrap-petri-specs

Composition layer for [wnp-petri-specs](../../petri/wnp-petri-specs).
Used within [wnp-boostrap-composer](../wnp-bootstrap-composer).

## install

```js
npm install --save wnp-bootstrap-petri-specs
```

## usage
```js
const PetriSpecsComposer = require('wnp-bootstrap-petri-specs');

const composer = new PetriSpecsComposer();

const syncSpecsExpressApp = composer.expressApp();

// later in your init sequence:
const petriSpecsManager = composer.createManager({env, config, log, rpcFactory});
```

##API

##PetriSpecsComposer#constructor(): PetriSpecsComposer
Creates a new instance of petri specs composer

##PetriSpecsComposer#expressApp(): [express.Application](https://expressjs.com/en/api.html#app)
Returns instance of express application with a route for `/sync-specs` endpoint

##PetriSpecsComposer#createManager({env, config, log, rpcFactory}): [PetriSpecsManager](../../petri/wnp-petri-specs/README.md)
Creates and returns a new instance of `PetriSpecsManager` or returns previously initialized instance.

Parameters:
 - `env` - node process environment
 - `config` - instance of [wix-config](../../config/wix-config)
 - `log` - instance of [wnp-debug.Logger](../../logging/wnp-debug)
 - `rpcFactory` - instance of [RPC client factory](../../rpc/wix-rpc-client-support)


