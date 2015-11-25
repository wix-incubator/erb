# bootstrap

bootstrap is a combination of modules that gives you:
 - [wix-bootstrap](wix-bootstrap) and [wix-bootstrap-cluster](wix-bootstrap-cluster) enables you to create a 'good wix citizen' type of app which takes care of:
   - monitoring;
   - failover;
   - logging;
   - ops contracts;
   - etc.
 - [wix-bootstrap-testkit](wix-bootstrap-testkit) gives you a way to run a `bootstrap` app in your e2e tests;
 - [wix-bootstrap-docker-base](wix-bootstrap-docker-base) is a preconfigured docker base image.

 # Install

 TBD: create http://yeoman.io/ generator?

 ```
 npm install --save wix-bootstrap
 npm install --save wix-bootstrap-cluster
 npm install --save-dev wix-bootstrap-testkit
 ```

# Usage

 Create following minimal files:

 **index.js** - app entry point:

 ```js
 'use strict';
const wixBootstrapCluster = require('wix-bootstrap-cluster');

wixBootstrapCluster.run(
  () => require('./app'),
  () => require('./config'));
 ```
 
IMPORTANT: you should have no other imports in `index.js` as they might interfere with master process and logic contain within it.

 **lib/config.js** - bootstrap wiring, given you will use `log4js` logger and want to override say express request timeout and use rest as defaults:
 
```js
'use strict';
const wixBootstrap = require('wix-bootstrap');

require('wix-logging-log4js-adapter').setup(require('log4js'));

wixBootstrap.setup({
  express: {
    requestTimeout: 1000
  }
);
```

**lib/app.js** - actual application

```js
'use strict';
const express = require('express'),
  uuidSupport = require('uuid-support');

module.exports = app => {
  const router = express.Router();

  //add custom error handling behavior
  app.use((req, res, next) => {
    res.on('x-error', err => res.status(500).send({name: 'x-error', message: err.message}));
    next();
  });

  //add custom request timeout behavior
  app.use((req, res, next) => {
    res.once('x-timeout', () => res.status(503).send({name: 'x-timeout', message: 'timeout'}));
    next();
  });

  app.get('/rpc', (req, res) => {
    wixBootstrap
      .rpcClient(`http://api.aus.wixpress.com:33213/some-rpc-server/RpcServer`)
      .invoke('hello', uuidSupport.generate())
      .then(
        resp => res.send(resp),
        err => res.status(500).send({message: err.message, name: err.name, stack: err.stack})
      );
  });

  return app;
};
```

**Dockerfile**

TBD

# Customization

TBD
 - write on 'x-error';
 - write on 'x-timeout';
 - anything else?

# Testing

TBD




