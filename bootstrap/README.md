# bootstrap

A go-to libraries for quickly starting a new 'wixy' node-based service. It contains:
 - [wix-bootstrap](wix-bootstrap) - main module that serves your app and takes care of monitoring, error handling, failover, logging...
 - [wix-bootstrap-testkit](wix-bootstrap-testkit) - run your app like a boss within your IT tests.

# Install

```
npm install --save wix-bootstrap
npm install --save-dev wix-bootstrap-testkit
```

# Getting started

To have a minimal bootstrap-based app you need an npm-based project with:
 - bootstrap entry-point - './index.js';
 - .js exposing your app as a function `(express, done) => {...};` - './lib/app.js';
 - docker assets - './Dockerfile', '.dockerignore';
 - tests for your app -  'test/app.spec.js'.

## bootstrap entry-point - ./index.js

 ```js
 'use strict';
const wixBootstrap = require('wix-bootstrap');

wixBootstrap.setup({
  express: {
    requestTimeout: 4000
  }
});

wixBootstrap.run(() => require('./lib/app'));
 ```

What happens here?:
 - `run` actually runs a [clustered](https://nodejs.org/api/cluster.html) node app with a worker process and several child processes (your app);
 - `run` bootstraps master with necessary 'plugins', monitoring, logging init, etc.
 - `setup(...)` is optional and is used to override defaults 

This is just an init script that starts your app `./app.js`, but some things are critical here:
 - you MUST NOT have another imports/global logic as it can interfer with cluster master workings and put your app in an 'unpredictable' state;
 - you should not `require('./app')` outside of 'run' function scope, as again, your 'app.js' can do some magic that is applicable on to a client process.

## Your REST API - ./lib/app.js

Say you want to serve '/rpc-example' and call external rpc server:

```js
'use strict';
const wixBootstrap = require('wix-bootstrap'),
  uuid = require('uuid-support');

module.exports = (app, cb) => {
  const rpcClient = wixBootstrap.rpcClient('http://localhost:2213', 'RpcServer');

  app.get('/rpc-example', (req, res, next) => {
    rpcClient
      .invoke('hello', uuid.generate())
      .then(resp => res.json(resp))
      .catch(next);
  });
  cb();
};
```

What happens here?:
 - you expose a single function `(app, done) => {...; done()};` that receives 2 parameters: express app that is being pre-wired and post-wired with middlewares that are necessary for you being a good-citizen in wix and getting support for: timeout handling, 'health/is_alive', monitoring, logging...
 - you have to of course call a 'done()' callback when you are done so bootstrap can proceed with whatever it is doing.

## Deployment descriptor - ./Dockerfile

```
FROM docker-repo.wixpress.com/com.wixpress.npm.wix-bootstrap:latest
MAINTAINER You <you@wix.com>

# add all app assets - .dockerignore excludes heavy stuff (node_modules, target).
ADD * /app/

# install deps
RUN npm install --production

# switch to unpriviledged user to run your app
USER deployer

# given /app/index.js exists
CMD node index.js
```

What happens here?:
 - well, not much - you just created a 'Dockerfile' so your app will be packaged as docker image and you can deploy it now and the sun will shine and birds will sing:)

## Docker context - ./.dockerignore

In addition you MUST have `.dockerignore` file to:
 - make sure heavy/unnecessary content is not added/transfered over to docker context.

```
node_modules
target
```

## Testkit/running an app - ./test/app.spec.js

Bootstrap provides serveral modules that will aid you in testing bootstrap-based app:

```js
'use strict';
const testkit = require('wix-bootstrap-testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('app', function () {
  this.timeout(10000);
  
  const app = testkit.bootstrapApp('./index.js');
  app.beforeAndAfter();

  it('should be available on "/"', ()) => {
    return fetch(app.getUrl('/')).then(res => {
      expect(res.status).to.equal(200);
    });
  });
});
```

For details on api please refer to [wix-bootstrap-testkit](wix-bootstrap-testkit).

# Recipes

Here are common recipes/customizations you can do within bootstrap.

## Rpc

Bootstrap exposes rpc client on a main singleton object ( `require('wix-bootstrap')` ) which you can use to get a new instance of [rpc client](../rpc/json-rpc-client) which is pre-wired with all needed hooks and configured to work in wix:

```js
const wixBootstrap = require('wix-bootstrap'),
  uuid = require('uuid-support');

module.exports = (app, cb) => {
  const rpcClient = wixBootstrap.rpcClient('http://localhost:2213', 'RpcServer');

  app.get('/rpc-example', (req, res, next) => {
    rpcClient
      .invoke('hello', uuid.generate())
      .then(resp => res.json(resp))
      .catch(next);
  });
  cb();
};
```

## Logging

Given you have an existing logging library (debug for a sake of example) which you want to use and whose log statements you want to end-up in logs, you should do:

```
npm install --save debug
npm install --save wix-logging-debug-adapter
```

and then in you './lib/app.js'

```js
require('wix-logging-debug-adapter').setup(require('debug'));
```

It will just adapt 'debug' library to send logging events to a wix infrastructure which will be enriched on their way with contextual data and formatted in accordance to familiar formats.

Note that 'setup(...)' does not work retroactively on logger instances you have created, so 

```js
const log = require('debug')('tag');

require('wix-logging-debug-adapter').setup(require('debug'));

log('my logging statement');

```

Will not work, whereas:

```js
const debug = require('debug');

require('wix-logging-debug-adapter').setup(require('debug'));

const log = debug('tag');

log('my logging statement');

```

Will work properly.

**Supported loggers:**
 - [log4js](https://www.npmjs.com/package/log4js) - [wix-logging-log4js-adapter](../logging/wix-logging-log4js-adapter);
 - [debug](https://www.npmjs.com/package/debug) - [wix-logging-debug-adapter](../logging/wix-logging-debug-adapter);
 - [console](https://nodejs.org/api/console.html) - [wix-logging-console-adapter](../logging/wix-logging-console-adapter);
 - [wix-logger](../logging/wix-logger) - used internally by platform;

## Error handling

Bootstrap provides you default error handling capabilities, which you can override within your app serving function:

```js

module.exports = (app, done) => {
  
  //Note: this should be placed before your request handlers/routers.
  app.use((req, res, next) => {
    res.on('x-error', err => res.status(500).send({name: 'x-error', message: err.message}));
    next();
  });

  //routes
}
```

What happened here?:
 - one of wired-in middlewares, in case of sync/async error adds event onto response `x-error`;
 - you can handle this event and, say, terminate response early with custom error code/response body;

## Request timeouts

Bootstrap adds default request timeout which you can both configure (see `setup()` in [wix-bootstrap](wix-bootstrap)) and act on:

```js

module.exports = (app, done) => {
  
  //Note: this should be placed before your request handlers/routers.
  app.use((req, res, next) => {
    res.on('x-timeout', error => res.status(503).send({name: error.name, message: error.message}));
    next();
  });

  //routes
}
```

What happened here?:
 - one of wired-in middlewares, in case request processing took longer than preconfigured timeout, adds event onto response `x-timeout`;
 - you can handle this event and, say, terminate response early with custom error code/response body.
