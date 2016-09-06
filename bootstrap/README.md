# bootstrap

 - [About](#about)
 - [Quick Start](#quick-start)
 - [Recipes](#recipes)
  - [Rpc](#rpc)
  - [BI](#bi)
  - [Petri](#petri)
  - [Aspects (Session, ...)](#aspects)
  - [NewRelic](#newrelic)
  - [Error handling](#error-handling)
  - [Request timeouts](#request-timeouts)
  - [Config Templates](#config-templates)
  - [Advanced docker](#advanced-docker)
  - [Setting-up on CI](#setting-up-on-ci)
  - [Deploying to production](#deploying-to-production)
  - [Override Caching Policy](#override-caching-policy)

## About

A go-to libraries for quickly starting a new 'wixy' node-based service. It contains:
 - [wix-bootstrap-ng](wix-bootstrap-ng) - main module that serves your app and takes care of monitoring, error handling, failover...
 - [wix-bootstrap-testkit](../bootstrap/wix-bootstrap-testkit) - run your app like a boss within your IT tests.

bootstrap does a lot of things for you and some of them are nice:
 - adds monitoring (new-relic, statsd);
 - adapts application to run within wix - app-info, environment variables just like in prod, new-relic config...
 - injects wix context - cookies, headers, ... and transfers them around (petri, rpc);

and some not so nice things:
 - monkeypatches whatever is needed (httpServer, promises...);
 - injects environment variables in dev mode;
 - turns-off new relic in dev mode.

## Quick Start

### Install

```bash
npm install --save wix-bootstrap-ng
npm install --save-dev wix-bootstrap-testkit
```

Common app will have:
 - entry-point - './index.js';
 - app context - './lib/config.js';
 - express app - './lib/express-app.js';
 - docker assets - './Dockerfile', '.dockerignore';
 - tests for your app -  'test/app.spec.js'.
 - config templates in `./templates`;


### entry-point - ./index.js

You want to have an app that calls rpc, your entry point will look like:

 ```js
'use strict';
const bootstrap = require('wix-bootstrap-ng');

bootstrap()
  .use(require('wix-bootstrap-rpc'))
  .config('./lib/config')  
  .express('./lib/app')
  .start();
 ```

What happens here?:
 - your app is being started in [clustered](https://nodejs.org/api/cluster.html) mode with a worker process and several child processes (your app);
 - app context is being built and multiple http servers (for your app and for management app) started;
 - Promise is returned from `start()` so you can tap onto it;

### config file `./templates/app.json.erb`

Given you need some environment-specific variables that should be processed by deployment system, you will need a config file like:
```json
{
  "services": {
    "metasite": "<%= service_url('com.wixpress.wix-meta-site-manager-webapp') %>"
  }
}
```

### app config - `./lib/config.js`
This is the place where you can setup your dependencies/assets to be used:
 - load config;
 - initialize database (ok, we don't have databases);
 - fetch remote data;

Results from `./lib/config.js` is being passed-on to your `express` exporting function.

Given you have a config in `/templates/app.json.erb`, which in production is being processed and moved to `/configs/app.json`, you could load your config and create rpc client template:

```js
'use strict';
module.exports = context => {
  const config = context.config.load('app');
  const metasiteRpcFactory = context.rpc.clientFactory(config.services.metasite, 'ServiceName');
  return {
    metasiteRpc: aspects => metasiteRpcFactory.client(aspects)
  };
}
```

### express app - `./lib/express-app.js`

Say you want to serve '/rpc-example' and call external rpc server:

```js
const express = require('express');

module.exports = config => {
  const app = new express.Router();
  
  app.get('/rpc-example', (req, res, next) => {
    const metasiteRpcClient = config.metasiteRpc(req.aspects);
    metasiteRpcClient.invoke('someMethod')
      .then(rpcResponse => res.json(rpcResponse))
      .catch(next);
  });

  //so you can access it via https://www.wix.com/your-artifact-name/_api
  return new express.Router().use('/api', app);
};
```

What happens here?:
 - you expose a single function `express => {...};` that receives 1 argument - result from `./lib/config.js` and must return either express `app` or `router` that will be served under default mount point and port.
 - Given you are doing some async init, you can return a `Promise` and 'bootstrap' will wait for promise to be resolved/rejected.

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
    return fetch(app.getUrl('/health/is_alive')).then(res => 
      expect(res.status).to.equal(200))
  );
});
```

For details on api please refer to [wix-bootstrap-testkit](wix-bootstrap-testkit).

### Deployment descriptor - Dockerfile

In most cases you are ok with the autopilot `Dockerfile`:

```Dockerfile
FROM docker-repo.wixpress.com/wix-bootstrap-onbuild:stable
MAINTAINER You <you@wix.com>
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

For RPC use module [wix-bootstrap-rpc](wix-bootstrap-rpc).

### BI

For BI use module [wix-bootstrap-bi](wix-bootstrap-bi).

### Petri

For Petri use module [wix-bootstrap-petri](wix-bootstrap-petri).

### Aspects

node-based bootstrap borrows `aspect` concept from jvm-based bootstrap for:
 - having normalized request-bound store for information extracted from request cookies/headers under `request.aspects`;
 - using/augmenting these aspects within platform modules that must pass contextual information down the line (rpc, petri, bi);
 - DRY both logic and processing-wise.

Accessing aspects within request is quite simple:

```js
app.get('/', (req, res) => {
  if (req.aspects['session']) {
    console.log(req.aspects['session'].userGuid);
  };
  res.end();
})
```

Where actual aspects and their respected properties can be found within [aspect module group](../aspects).

### NewRelic

[New relic](https://www.npmjs.com/package/newrelic) is injected, preconfigured and made available for you within express `app.locals.newrelic` and `context.newrelic`.

```js
'use strict';
const express = require('express');
module.exports = config => {
  const app = new express.Router()
  app.get('/', (req, res) => {
    res.send({
      fromReq: req.app.locals.newrelic.getBrowserTimingHeaders(),
      fromApp: app.locals.newrelic.getBrowserTimingHeaders()
  });

  return app;
};
```

And you can use it as [prescribed by new relic](https://docs.newrelic.com/docs/agents/nodejs-agent/supported-features/page-load-timing-nodejs#variables).

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

Bootstrap adds default request timeout which you can both configure (see `setup()` in [wix-bootstrap](wix-bootstrap-ng)) and act on:

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

You should read-on instructions on [wnpm-ci](https://github.com/wix/wnpm/tree/master/wnpm-ci) or just checkout package.json of [das-boot-ng](das-boot-ng) and once package.json + .nvmrc are in your project, just add it via [lifecycle](https://lifecycle.wix.com/cp/#/buildManagement) as 'NODE' project.

### Deploying to production

1. Ask IgalH to enable GA for you module once you did RC;
2. Set-up your artifact via [Fryingpan](https://fryingpan.wixpress.com/#docker_tab) - see [das-boot-ng](https://fryingpan.wixpress.com/services/com.wixpress.npm.das-boot-ng) as an example;
3. Add servers, ga, and wait for it to be deployed.

### override caching policy
By default bootstrap returns no-cache headers, you can override that functionality:

```js
	const cachingPolicy = require('wix-express-caching-policy');
	// specific time cache
        app.use('/specific', cp.specificAge(1000));
```

For more options please refer to [wix-express-caching-policy](../express/wix-express-caching-policy).
