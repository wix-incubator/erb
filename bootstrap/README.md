# bootstrap

 - [About](#about)
 - [Quick Start](#quick-start)
 - [Recipes](#recipes)
  - [Rpc](#rpc)
  - [Logging](#logging)
  - [Error handling](#error-handling)
  - [Request timeouts](#request-timeouts)
  - [Config Templates](#config-templates)
  - [Running locally](#running-locally)
  - [Cleaning-up Resources](#cleaning-up-resources)
  - [Advanced docker](#advanced-docker)
  - [Setting-up on CI](#setting-up-on-ci)
  - [Deploying to production](#deploying-to-production)
  - [Override Caching Policy](#override-caching-policy)

## About

A go-to libraries for quickly starting a new 'wixy' node-based service. It contains:
 - [wix-bootstrap](wix-bootstrap) - main module that serves your app and takes care of monitoring, error handling, failover, logging...
 - [wix-bootstrap-testkit](wix-bootstrap-testkit) - run your app like a boss within your IT tests.

bootstrap does a lot of things for you and some of them are nice:
 - adds monitoring (new-relic, statsd);
 - adapts application to run within wix - app-info, environment variables just like in prod, new-relic config...
 - adapts logging - just write log and it will land in proper places and will be collected;
 - injects wix context - cookies, headers, ... and transfers them around (petri, rpc);

and some not so nice things:
 - monkeypatches whatever is needed (httpServer, promises...);
 - injects environment variables in dev mode;
 - turns-off new relic in dev mode.

## Quick Start

### Install

```
npm install --save wix-bootstrap
npm install --save-dev wix-bootstrap-testkit
```

To have a minimal bootstrap-based app you need an npm-based project with:
 - bootstrap entry-point - './index.js';
 - .js exposing your express app as a function `express => {...};` - './lib/app.js';
 - docker assets - './Dockerfile', '.dockerignore';
 - tests for your app -  'test/app.spec.js'.
 
Optionally:
 - config templates in `./templates`;

### bootstrap entry-point - ./index.js

 ```js
 'use strict';
const wixBootstrap = require('wix-bootstrap');

wixBootstrap.setup({
  express: {
    requestTimeout: 4000
  }
});

wixBootstrap
  .express('./lib/app')
  .start();
 ```

What happens here?:
 - `start` actually runs a [clustered](https://nodejs.org/api/cluster.html) node app with a worker process and several child processes (your app);
 - `start` bootstraps master process with necessary 'plugins' - monitoring, logging init, etc.
 - `setup(...)` is optional and is used to override defaults 

This is just an init script that starts your app `./app.js`, but some things are critical here:
 - you MUST NOT have another imports/global logic as it can interfer with cluster master workings and put your app in an 'unpredictable' state;

### Your REST API - ./lib/app.js

Say you want to serve '/rpc-example' and call external rpc server:

```js
'use strict';
const wixBootstrap = require('wix-bootstrap'),
  uuid = require('uuid-support');

module.exports = express => {
  const rpcClient = wixBootstrap.rpcClient('http://localhost:2213', 'RpcServer');

  express.get('/rpc-example', (req, res, next) => 
    rpcClient
      .invoke('hello', uuid.generate())
      .then(resp => res.json(resp))
      .catch(next);
  );
};
```

What happens here?:
 - you expose a single function `express => {...};` that receives 1 parameter: express app that is being pre-wired and post-wired with middlewares that are necessary for you being a good-citizen in wix and getting support for: timeout handling, 'health/is_alive', monitoring, logging...
 - Given you are doing some async init, you can return a Promise and 'bootstrap' will wait for promise to be resolved/rejected.

## Testkit/running an app - ./test/app.spec.js

Bootstrap provides serveral modules that will aid you in testing bootstrap-based app:

```js
'use strict';
const testkit = require('wix-bootstrap-testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('app', function () {
  this.timeout(10000);
  
  const app = testkit
    .server('./index')
    .beforeAndAfter();

  it('should be available on "/"', () => 
    return fetch(app.getUrl('/')).then(res => 
      expect(res.status).to.equal(200))
  );
});
```

For details on api please refer to [wix-bootstrap-testkit](wix-bootstrap-testkit).

### Deployment descriptor - Dockerfile

In most cases you are ok with the autopilot `Dockerfile`:

```Dockerfile
FROM docker-repo.wixpress.com/com.wixpress.wix-bootstrap-docker-onbuild:snapshot
MAINTAINER Vilius Lukosius <vilius@wix.com>
```

and `.dockerignore`

```
node_modules
target
```

What happens here?
 - base dockerfile has instructions to do all of the work for you: copying over app assets, running npm install, setting right permissions, etc.
 - `.dockerignore` makes your docker builds faster and avoids moving unnecessary stuff around.

## Recipes

Here are common recipes/customizations you can do within bootstrap.

### Rpc

Bootstrap exposes rpc client on a main singleton object ( `require('wix-bootstrap')` ) which you can use to get a new instance of [rpc client](../rpc/json-rpc-client) which is pre-wired with all needed hooks and configured to work in wix:

```js
const wixBootstrap = require('wix-bootstrap'),
  uuid = require('uuid-support');

module.exports = express => {
  const rpcClient = wixBootstrap.rpcClient('http://localhost:2213', 'RpcServer');

  express.get('/rpc-example', (req, res, next) => {
    rpcClient
      .invoke('hello', uuid.generate())
      .then(resp => res.json(resp))
      .catch(next);
  });
};
```

For more details on api please see [rpc client](../rpc/json-rpc-client).

### Logging

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

### Error handling

Bootstrap provides you default error handling capabilities, which you can override within your app serving function:

```js

module.exports = app => {
  
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

### Request timeouts

Bootstrap adds default request timeout which you can both configure (see `setup()` in [wix-bootstrap](wix-bootstrap)) and act on:

```js

module.exports = app => {
  
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

### Config Templates

**Config templates for production**

Given you want to have configs with values injected by chef in production, you have to place your configs in './templates' and name them '*.erb'. I recommend using '*.json.erb' if you want to use [wix-config](../configs/wix-confing) module for loading configs.

Say you have 'your-app-name.json.erb' in './templates'

```
{
  "services": {
    "metasite": "<%= service_url("com.wixpress.wix-meta-site-manager-webapp") %>"
  }
}
```

Where chef during deployment to production will inject values according to rules defined in [Wix Artifact Config Templates](https://kb.wixpress.com/pages/viewpage.action?title=Wix+Artifact+Config+Templates&spaceKey=chef). 

**Generating configs for tests from '.erb' templates**

In order to generate configs from '.erb' templates for your tests you should use [wix-config-emitter](../config/wix-config-emitter).

In your test set-up you should do:

```
const rpcServerPort = 8081;

require('wix-config-emitter')()
  .fn('service_url', 'com.wixpress.wix-meta-site-manager-webapp', 'http://localhost:8081')
  .emit();
```

And config will be generated and saved to './test/configs'.

**Loading confings in code**

```js
const appConfig = require('wix-config').load('your-app-name');

```

to load json config.

### Running locally

There are two ways to load your service to testing:

#### wix-bootstrap-testkit

It gives you api to run your app, waits for it to boot and ways to override environment variables.

#### 'node index.js'

Given you run your via simple `node index.js`, `wix-bootstrap` will detect that it's not running in production (NODE_ENV !== 'production') and will inject:
 - default wix-bootstrap.json config which you can override with one present in `./test/configs`;
 - defaults for mandatory environment variables:
  - PORT: 3000,
  - MANAGEMENT_PORT: 3004,
  - MOUNT_POINT: '',
  - APP_CONF_DIR: './test/configs'.

It also prints to stdout injected config and environment variables.

### Cleaning-up Resources

Bootstrap allows you to register hooks for cleaning-up resources before normal/abnormal process termination.

Anywhere in your code you can:

```js
require('wix-bootstrap').addShutdownHook(() => {
  console.log('Cleaning-up');
});
```

### Advanced docker

Example provided in [Quick Start](#quick-start) shows you how to use the easiest docker set-up for production and it should work fine in like 99% of set-ups. But:
 - if you need extra system packages (say imagemagick);
 - have a different set-up for whatever reason;

You can always fallback to:
 - [wix-bootstrap-docker-base](wix-bootstrap-docker-base) - has bootstrap config and needed environment variables set-up, but you will have to copy your assets, do mvn install and whatever else is needed by yourself;
 - [wix-node-docker-base](https://github.com/wix/wix-node-docker-base) - almost the same as [wix-bootstrap-docker-base](wix-bootstrap-docker-base), but it does not have wix-bootstrap.json config in /templates, so you will have to do it yourself. Please see what [wix-bootstrap-docker-onbuild](wix-bootstrap-docker-onbuild) does and copy/paste:)

### Setting-up on CI

For your module to work properly in ci you need:
 - package.json set-up just as described in [wnpm-ci](https://github.com/wix/wnpm/tree/master/wnpm-ci);
 - .nvmrc with node version you need;
 - pom.xml with unique groupId and artifactId.

You should read-on instructions on [wnpm-ci](https://github.com/wix/wnpm/tree/master/wnpm-ci) or just checkout package.json of [das-boot](das-boot) and once package.json + .nvmrc are in your project, just add it via [lifecycle](https://lifecycle.wix.com/cp/#/buildManagement) as 'NODE' project.

### Deploying to production

1. Ask IgalH to enable GA for you module once you did RC;
2. Set-up your artifact via [Fryingpan](https://fryingpan.wixpress.com/#docker_tab) - see [das-boot](https://fryingpan.wixpress.com/services/com.wixpress.npm.das-boot) as an example;
3. Add servers, ga, and wait for it to be deployed.

### override caching policy
By default bootstrap returns no-cache headers, you can override that functionality:

```js
	const cachingPolicy = require('wix-express-caching-policy');
	// specific time cache
        app.use('/specific', cp.specificAge(1000));
```

For more options please refer to [wix-express-caching-policy](../express/wix-express-caching-policy).