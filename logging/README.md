# wix logging

Wix logging is a set of modules that provide a unified facade and backend for plugging-in any existing logger into a wix app and still having unified support for:
 - logging event enrichment from [aspects](../aspects) with metadata form request;
 - single output format that conforms to ops contract;
 - is [node cluster](https://nodejs.org/api/cluster.html) aware/safe - it means that logging events are routed through cluster master, which gives us possibility to have file rotation(file rotation if writing is done from multiple processes is at least tricky), etc.

Wix logging is a set of modules to provide:
 - adapters to an existing logging libraries (`wix-logging-*-adapter`);
 - support for creating additional adapters (`wix-logging-client`, `wix-logging-adapter-testkit`);
 - support for enriching logging events with metadata from ex. `express` request context (`wix-logging-client-support`);
 - [plugin](wix-logging-cluster-plugin) for `wix-cluster` as a backend which does actual logging event formatting and routing in accordance to ops contract.

Currently it supports following existing logging libraries:
 - [log4js](https://www.npmjs.com/package/log4js) - [wix-logging-log4js-adapter];
 - [console](https://nodejs.org/api/console.html) - [wix-logging-console-adapter];
 - [debug](https://www.npmjs.com/package/debug) - [wix-logging-debug-adapter].

And provides one used by platform itself:
 - [wix-logger](wix-logger/).

For usage of these logging libraries please see to modules itself, or if you like another logging library - just implement adapter for that logging library, see [wix-logging-log4js-adapter] for an example.

# usage

**log4js - complete** 

This is full example of wiring complete app - with clustering, etc.


```js
const wixCluster = require('wix-cluster'),
  wixClusterLoggingPlugin = require('wix-cluster-logging-plugin'),
  express = require('express');
  wixExpressDomain = require('wix-express-domain'),
  wixExpressReqContext = require('wix-express-req-context'),
  log4js = require('log4js'),

require('wix-logging-client-support').addTo(require('wix-logging-client'));//binds shared client with aspects for metadata enrichment.
require('wix-logging-log4js-adapter').setup(log4js);//adapts log4js to 'wix-logging-client'.

function app() {
  const app = express();
  //minimal set of middlewares for express to provide metadata.
  app.use(wixExpressDomain);
  app.use(wixExpressReqContext);

  app.get('/', (req, res) => {
  	log4js.getLogger('app').info('got request');
  	res.end('hi');
  });

  return app;
}

wixCluster.builder(app)
	.addPlugin(wixClusterLoggingPlugin())//adds logging backend to cluster.
	.start();
```

**log4js - in pre-wired app** 


Example of usage given you have all middlewares, cluster, supports prepared for you (bootstra).

```js
//this is your app.js
const log4js = require('log4js'),
    
require('wix-logging-log4js-adapter').setup(log4js);

function calledFromSomewhereElse() {
    log4js.getLogger('category').info('something I would like to log');
}
//...

```

Given a proper wiring is done, this logging message will be written to proper place based on environment:
 - dev env - stdout/stderr;
 - prod env - files it service log folder.