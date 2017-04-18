# wix-petri-client

Wix petri client intended to conduct AB tests. It's a thin client that uses Wix RPC to conduct experiments against [wix-laboratory-server](https://github.com/wix-private/wix-petri/tree/master/wix-laboratory-server). 

It depends on:
 - fully configured [wix-json-rpc-client](../../rpc/wix-json-rpc-client) with needed aspects hooked-up;
 - [wix-laboratory-server](https://github.com/wix-private/wix-petri/tree/master/wix-laboratory-server) url.

## install

```js
npm install --save wix-petri-client
```

## usage

```js
const petri = require('wix-petri-client').factory(rpcFactory, 'http://laboratory:3000');

//feature toggle
petri.client(aspects)
  .conductExperiment('aFT', 'false')
  .then(res => console.log(res));//logs 'true' if FT is enabled

//AB test with 'win'||'lose'
petri.client(aspects)
  .conductExperiment('anAB', 'lose')
  .then(res => console.log(res));//logs 'win' if got into winning group

petri.client(aspects)
  .conductAllInScope('aScope')
  .then(res => console.log());// {'key1': 'win', 'key2': 'lose'};
```

## Api
## factory(rpcFactory, url): WixPetriClientFactory
Creates a new instance of `WixPetriClientFactory`.

Parameters:
 - rpcFactory - preconfigured instance of [wix-json-rpc-client](../../rpc/wix-json-rpc-client) to be used.
 - url - url of laboratory server (http://host:port/wix-laboratory-server) as would be injected by deployment system.

## WixPetriClientFactory.client(aspects): WixPetriClient
Creates an instane of `WixPetriClient` bound to provided `aspects`.

Parameters:
 - aspects - see [aspects](../../aspects).

## WixPetriClient.conductExperiment(key, fallbackValue): Promise(winning||losing)
Conducts an experiment against laboratory server and returns a `Promise` with result - value depending on experiment configuration or a fallback value if experiment is not active.

Parameters:
 - key - mandatory, string: experiment/feature toggle key;
 - fallbackValue - mandatory, string: value that will be returned given experiment does not exist or is not active or in a case when the communication with petri server had failed.

## WixPetriClient.conductAllInScope(scope): Promise
Conducts all experiments for `scope` against laboratory server and returns a `Promise` with result - object with experiment keys/values.

Parameters:
 - scope - mandatory, string: scope for which all experiments should be conducted;
 
 ## WixPetriClient.conductAllInScopes(...scopes): Promise
 Conducts all experiments for all `scopes` against laboratory server and returns a `Promise` with result - object with experiment keys/values.
 
 Parameters:
  - scopes - mandatory, varargs: scopes for which all experiments should be conducted;
 
