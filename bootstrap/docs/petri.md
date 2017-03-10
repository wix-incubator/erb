# Petri

## Table of Contents
- [Petri & Node.js](#petri--nodejs)
- [Defining Experiment Specifications](#defining-experiment-specifications)
- [Conducting experiments](#conducting-experiments)
- [Testkit](#testkit)                                     

### Petri & Node.js
Node.js based services use petri to conduct its experiments as a service, out of node process. 
Which means that each conduction issues a request to the [laboratory server](https://github.com/wix-private/wix-petri/tree/master/wix-laboratory-server). 
(opposed to java, where petri is a library running within the process). So there's a penalty of external call and possible 
network failures.

### Defining Experiment Specifications
In order to define an experiment in petri's backoffice [guineapig](https://guineapig.wix.com/home/),
petri has to be aware of the experiment specification (think JavaScript's prototype). 

Bootstrap's [context](../wix-bootstrap-ng/README.md#context) has `petri.addSpecs(obj)` method to handle it.

_example:_
######/lib/petri-specs.js
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
module.exports.keys = Object.keys(module.exports.all).reduce((acc, key) => { acc[key] = key; return acc }, {});
```

######/lib/config.js
```js
const specs = require('./petri-specs');

module.exports = context => {
  // register your specifications
  context.petri.addSpecs(specs.all);
  
  return {
    // export petri client factory so it will be available in your express app  
    petri: aspects => context.petri.client(aspects),
  }
};
```

### Conducting experiments
There're two APIs to conduct experiment(s):
- `conductExperiment` - conduct a single experiment by its key, providing a fallback value
- `conductAllInScope` - bulk conduct of all experiments for a given scope (mostly used to propagate those to the client side)

(more on those APIs [here](../../petri/wix-petri-client/README.md#api))

_example:_
######/lib/express-app.js
```js
const specs = require('./petri-specs');

module.exports = (app, config) => {

  // conducting experiment on server        
  app.get('/api/to-live-or-not', (req, res, next) => {
    // conduct the experiment in your code
    config.petri(req.aspects)
      .conductExperiment(specs.keys.MySpecForExperiment2, 'fallback-value')
      .then(resp => {
         switch (resp) {
           case 'kill':           res.send('we killed kenny');   
                                  break;
           
           case 'kill-not':       res.send('we will kill kenny later')
                                  break;
           
           case 'fallback-value': res.send('booring booring booring')
                                  // either the experiment is not defined (yet/already) or 
                                  // we failed to talk to the laboratory server  
         }
      }).catch(next);    
  });
  
  // propagating conducted experiments to the client
  app.get('/index.html', (req, res, next) => {
    const experimentsForTheClient = config.petri(req.aspects).conductAllInScope('my-service-scope');
    res.render('index', {experimentsForTheClient}); // assuming we have a view with that name
  });
};
```
_wiring all together:_
######/index.js
```js
const bootstrap = require('wix-bootstrap-ng');

bootstrap()
  .config('./lib/config')
  .express('./lib/express-app')
  .start();

```

### Testkit
For your IT/E2E tests you might want to use [wix-petri-testkit](../../petri/wix-petri-testkit/README.md) to verify 
different experiment conduction outcomes and flows.

_example:_
######/test/kenny.it.js
```js
const testkit = require('wix-bootstrap-testkit'),
  petriTestkit = require('wix-petri-testkit'),
  expect = require('chai').expect,
  axios = require('axios');

describe('my service with petri', () => {
  const laboratoryFakeServer = petriTestkit.server().beforeAndAfter();
  const kennyServer = testkit.server('./index', {env: {WIX_BOOT_LABORATORY_URL: `http://localhost:${laboratoryFakeServer.getPort()}`}}).beforeAndAfter();
  
  it('should kill kenny due to experiment', () => {
    laboratoryFakeServer.onConductExperiment((key, fallback) => key === 'MySpecForExperiment2' ? 'kill' : fallback);
    
    return axios(kennyServer.getUrl('/api/to-live-or-not'))
      .then(res => expect(res.data).to.equal('we killed kenny'));    
  });
  
  it('should render conducted experiments to client', () => {
    laboratoryFakeServer.onConductAllInScope(scope => scope === 'my-service-scope' ? {'MySpecForExperiment1':'foobar', 'MySpecForExperiment2': 'kill-not'} : {}); 
    return axios(kennyServer.getUrl('/index.html'))
      .then(res => expect(res.data).to.have.string('foobar'));
  });
});

```
