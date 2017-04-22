# Petri

Table of Contents
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

  * [Petri & Node.js](#petri--nodejs)
  * [Defining Experiment Specifications](#defining-experiment-specifications)
  * [Conducting experiments](#conducting-experiments)
  * [Testkit](#testkit)

</details>
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

### Petri & Node.js
Node.js based services use petri to conduct its experiments as a service, out of node process. 
Which means that each conduction issues a request to the [laboratory server](https://github.com/wix-private/wix-petri/tree/master/wix-laboratory-server). 
(opposed to java, where petri is a library running within the process). So there's a penalty of external call and possible 
network failures.

### Defining Experiment Specifications
In order to define an experiment in petri's backoffice [guineapig](https://guineapig.wix.com/home/),
petri has to be aware of the experiment specification (think JavaScript's prototype). 

Bootstrap's [context](../wix-bootstrap-ng/README.md#context) has `petri.addSpecs(obj)` method to handle it.

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/petri/lib/petri-specs.js) -->
<!-- The below code snippet is automatically added from ../test-apps/petri/lib/petri-specs.js -->
```js
// define your specifications
const specs = {
  'MySpecForExperiment1': {
    scope: 'my-service-scope',
    owner: 'thatsme@wix.com',
    onlyForLoggedInUsers: true,
  },
  'MySpecForExperiment2': {
    scope: 'my-service-scope',
    owner: 'thatsme@wix.com',
    onlyForLoggedInUsers: false,
    persistent: false,
    allowedForBots: false,
    testGroups: ['kill', 'kill-not']
  }
};

// helpers. see usage below
module.exports.all = Object.assign({}, specs);
module.exports.keys = Object.keys(module.exports.all).reduce((acc, key) => {
  acc[key] = key;
  return acc
}, {});
```
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/petri/lib/petri-specs.js) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

### Conducting experiments
There're two APIs to conduct experiment(s):
- `conductExperiment` - conduct a single experiment by its key, providing a fallback value
- `conductAllInScope` - bulk conduct of all experiments for a given scope (mostly used to propagate those to the client side)

(more on those APIs [here](../../petri/wix-petri-client/README.md#api))

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/petri/lib/express-app.js) -->
<!-- The below code snippet is automatically added from ../test-apps/petri/lib/express-app.js -->
```js
const specs = require('./petri-specs');

module.exports = (app, context) => {
  context.petri.addSpecs(specs.all);
  const petriClient = aspects => context.petri.client(aspects);

  app.set('view engine', 'pug');
  
  // conducting experiment on server        
  app.get('/api/to-live-or-not', (req, res, next) => {
    // conduct the experiment in your code
    petriClient(req.aspects)
      .conductExperiment(specs.keys.MySpecForExperiment2, 'fallback-value')
      .then(resp => {
        switch (resp) {

          case 'kill':
            res.send('we killed kenny');
            break;

          case 'kill-not':
            res.send('we will kill kenny later');
            break;

          // either the experiment is not defined (yet/already) or we failed to talk to the laboratory server
          case 'fallback-value':
            res.send('booring booring booring');
        }
      }).catch(next);
  });

  // propagating conducted experiments to the client
  app.get('/index.html', (req, res, next) => {
    petriClient(req.aspects)
      .conductAllInScope('my-service-scope')
      .then(experiments => res.render('index', {experimentsForTheClient: JSON.stringify(experiments)})) // assuming we have a view with that name
      .catch(next);
  });
  
  return app;
};
```
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/petri/lib/express-app.js) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

and

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/petri/index.js) -->
<!-- The below code snippet is automatically added from ../test-apps/petri/index.js -->
```js
require('wix-bootstrap-ng')()
  .express('./lib/express-app')
  .start();
```
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/petri/index.js) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->


### Testkit
For your IT/E2E tests you might want to use [wix-petri-testkit](../../petri/wix-petri-testkit/README.md) to verify 
different experiment conduction outcomes and flows.

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/petri/test/express-app.it.js) -->
<!-- The below code snippet is automatically added from ../test-apps/petri/test/express-app.it.js -->
```js
const testkit = require('wix-bootstrap-testkit'),
  petriTestkit = require('wix-petri-testkit'),
  {expect} = require('chai'),
  axios = require('axios');

describe('my service with petri', function () {
  this.timeout(8000);

  const laboratoryFakeServer = petriTestkit.server().beforeAndAfter();
  const kennyServer = testkit.server('./index', {
    env: {
      WIX_BOOT_LABORATORY_URL: `http://localhost:${laboratoryFakeServer.getPort()}`
    }
  }).beforeAndAfter();

  it('should kill kenny due to experiment', () => {
    laboratoryFakeServer.onConductExperiment((key, fallback) => key === 'MySpecForExperiment2' ? 'kill' : fallback);

    return axios(kennyServer.getUrl('/api/to-live-or-not'))
      .then(res => expect(res.data).to.equal('we killed kenny'));
  });

  it('should render conducted experiments to client', () => {
    laboratoryFakeServer.onConductAllInScope(scope => scope === 'my-service-scope' ? {
      'MySpecForExperiment1': 'foobar',
      'MySpecForExperiment2': 'kill-not'
    } : {});
    return axios(kennyServer.getUrl('/index.html'))
      .then(res => expect(res.data).to.have.string('foobar'));
  });
});
```
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/petri/test/express-app.it.js) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

For complete sources you can check-out [petri test-app](../test-apps/petri).