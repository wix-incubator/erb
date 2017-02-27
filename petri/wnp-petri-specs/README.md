# wnp-petri-specs

`PetriSpecsManager` class for handling petri specs registration and transfer to petri server over RPC.

## install

```js
npm install --save wnp-petri-specs
```

## usage

```js
const PetriSpecsManager = require('wnp-petri-specs'),
  rpcClient = require('wix-json-rpc-client'),
  log = require('wix-logger')('my-logger');
  
const petriSpecsManager = new PetriSpecsManager(rpcClient.factory(), 'http://petri-server-url/', log);

const specs = {
  spec1: {
    scope: 'myScope',
    owner: 'thats-me@wix.com',
    onlyForLoggedInUsers: true,
  },
  spec2: {
    scope: 'myScope',
    owner: 'thats-me@wix.com',
    onlyForLoggedInUsers: false,
  }
};

// register your specs
petriSpecsManager.addSpecs(specs);

// launch them to petri server
petriSpecsManager.send();
```

## API
## PetriSpecsManager#constructor(rpcFactory, url, log)
Creates a new instance of `PetriSpecsManager`.

Parameters:
 - `rpcFactory` - preconfigured instance of [wix-json-rpc-client](../../rpc/wix-json-rpc-client) to be used.
 - `url` - url of petri server (http://host:port/wix-petri-server) as would be injected by deployment system.
 - `log` - instance of [Logger](../../logging/wnp-debug)

## PetriSpecsManager#addSpecs(specs)
Registers petri specs within the manager

Parameters:
 - `specs` - map of specs in the following format:
```json
{
  "my.spec.key": {
    "scope": "the-scope",
    "owner": "my-email@wix.com",
    "onlyForLoggedInUsers": false,
    "persistent": false,            // optional, defaults to true 
    "allowedForBots": false,        // optional, defaults to false
    "testGroups": ["true", "false"] // optional
  }
  // more specs
}
```

## PetriSpecsManager#send(): Promise(Array(string))
Sends registered specs to petri server

Returns:
 - `Promise` with an `array` of spec keys sent 
 
 

