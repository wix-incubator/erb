# wix-petri-testkit

Testkit for [wix-petri-client](../wix-petri-client) that fakes [wix-laboratory-server](https://github.com/wix-private/wix-petri/tree/master/wix-laboratory-server) and allows to return canned responses.

## install

```js
npm install --save-dev wix-petri-testkit
```

## usage

```js
const rpcFactory = require('wix-json-rpc-client').factory(),
  petriClient = require('wix-petri-client'),
  petriTestkit = require('wix-petri-testkit'),
  expect = require('chai').expect;

describe('petri test', () => {
  const petriServer = petriTestkit.server({port: 3020}).beforeAndAfter();

  it('should conduct experiment', () => {
    petriServer.onConductExperiment((key, context) => true);
	const petriFactory = petriClient.factory(rpcFactory.factory(), 'http://localhost:3020');

    return petriFactory.client({})
	  .conductExperiment('anFT')
	  .then(res => expect(res).to.equal(true));
  });

  it('should conduct experiment', () => {
    petriServer.onConductAllInScope((scope, context) => {'aKey': 'aValue', 'anotherKey': 'anotherValue'}});
	const petriFactory = petriClient.factory(rpcFactory.factory(), 'http://localhost:3020');

    return petriFactory.client({})
	  .conductAllInScope('aScope')
	  .then(res => expect(res).to.contain.deep.property('aKey', 'aValue'));
  });
});
```

## Api

## server(opts): WixPetriTestkit
Creates a new instance of a testkit. It extends [wix-testkit-base](../../testing/wix-testkit-base), so it gets all base methods (start, stop, beforeAndAfter, beforeAndAfterEach).

Parameters:
 - opts: object, with keys:
  - port: port to listen to, defaults to 3020;

## WixPetriTestkit.onConduct(cb(key, context))
Allows to attach handler for `conductExperiment` calls.

Handler receives parameters:
 - key: experiment key;
 - context: object, with keys:
  - userId - id of a callee if any (undefined for userless call).

## WixPetriTestkit.onConductAllInScope(cb(key, context))
Allows to attach handler for `conductAllInScope` calls.

Handler receives parameters:
 - scope: scope(component);
 - context: object, with keys:
  - userId - id of a callee if any (undefined for userless call).