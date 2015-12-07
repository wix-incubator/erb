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
 - docker image - './Dockerfile';
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

Say you want to serve '/rpc' and call external rpc server:

```js
'use strict';
const express = require('express'),
  uuidSupport = require('uuid-support');

module.exports = (app, done) => {

  //TODO: replace with url from config.
  app.get('/rpc', (req, res) => {
    wixBootstrap
      .rpcClient(`http://api.aus.wixpress.com:33213/some-rpc-server/RpcServer`)
      .invoke('hello', uuidSupport.generate())
      .then(
        resp => res.send(resp),
        err => res.status(500).send({message: err.message, name: err.name, stack: err.stack})
      );
  });

  done();
};
```

What happens here?:
 - you expose a single function `(app, done) => {...; done()};` that receives 2 parameters: express app that is being pre-wired and post-wired with middlewares that are necessary for you being a good-citizen in wix and getting support for: timeout handling, 'health/is_alive', monitoring, logging...
 - you have to of course call a 'done()' callback when you are done so bootstrap can proceed with whatever it is doing.

## Deployment descriptor - ./Dockerfile

```
FROM docker-repo.wixpress.com/com.wixpress.wix-node-bootstrap:latest
MAINTAINER You <you@wix.com>

# add package and install modules - make it explicit step before adding sources,
# so you could benefit from docker caching
ADD package.json /app/
RUN npm install --production

# add config (.erb)
ADD templates/ /templates

# add app assets - /app is designated folder for you app
RUN mkdir /app/lib
ADD lib /app/lib/
ADD *.js /app/

# switch to unpriviledged user to run your app
USER deployer

# given /app/index.js exists
CMD node index.js
```

What happens here?:
 - well, not much - you just created a 'Dockerfile' so your app will be packaged as docker image and you can deploy it now and the sun will shine and birds will sing:)

## Testkit/running an app - ./test/app.spec.js

TBD

# Recipes

Here are common recipes/customizations you can do within bootstrap.

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

## Error handling

TBD

## Request timeouts

TBD

## Custom monitoring events

TBD