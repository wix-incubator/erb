# wix-petri-testkit

Testkit for [wix-petri-client](../wix-petri-client) that fakes [wix-laboratory-server](https://github.com/wix-private/wix-petri/tree/master/wix-laboratory-server) and allows to return canned responses.

Note that you have to attach callbacks for `onConductExperiment`, `onConductAllInScope` otherwise petri client will return rejected promises with rpc error.

## install

```js
npm install --save-dev wix-petri-testkit
```

## usage

```js
const rpcFactory = require('wix-json-rpc-client').factory,
  petriClient = require('wix-petri-client'),
  petriTestkit = require('wix-petri-testkit'),
  expect = require('chai').expect;

describe('petri test', () => {
  const petriServer = petriTestkit.server({port: 3020}).beforeAndAfter();

  beforeEach(() => petriServer.reset());

  it('should conduct experiment', () => {
    petriServer.onConductExperiment((key, fallback) => 'true');
	const petriFactory = petriClient.factory(rpcFactory(), 'http://localhost:3020');

    return petriFactory.client({})
	  .conductExperiment('anFT')
	  .then(res => expect(res).to.equal('true'));
  });

  it('should conduct experiment', () => {
    petriServer.onConductAllInScope(scope => {'aKey': 'aValue', 'anotherKey': 'anotherValue'}});
	const petriFactory = petriClient.factory(rpcFactory(), 'http://localhost:3020');

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

## WixPetriTestkit.onConductExperiment(cb(key, fallback))
Allows to attach handler for `conductExperiment` with parameters:
 - key - experiment key;
 - fallback - fallback value;

You should return an object with expected result.

## WixPetriTestkit.onConductAllInScope(cb(key))
Allows to attach handler for `conductAllInScope` with parameters:
 - scope - scope (component).

You should return an object with experimentKey/value pairs.

## WixPetriTestkit.getPort(): int
Returns port on which testkit will be started/is running.

## WixPetriTestkit.reset()
Resets behavior of `onConduct*` handlers to default (erroring).
