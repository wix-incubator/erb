# wnp-bootstrap-composer

Module for composing an wix'y app that provides following features:
 - aware of environment variables for main/management app listening ports and mount-points;
 - allows to add plugins;

This module depends on environment variables:
 - PORT - main app port;
 - MANAGEMENT_PORT - management app port;
 - APP_CONF_DIR - folder where configs are located;
 - MOUNT_POINT - app mount point;
 - APP_TEMPL_DIR - folder where config tempaltes (.erb) are located;
 - APP_PERSISTENT_DIR - folder where files are retained between docker container restarts; 
 - APP_LOG_DIR - log folder;
 - HOSTNAME - hostname.

## restful api

app, in addition to contract imposed by deployment system (health/is_alive, deployment/test) also exposes:
 - POST http://localhost:{MANAGEMENT_PORT}{MOUNT_POINT}/close - endpoint that can do one of (in dev environment):
  - stop worker process in clustered environment;
  - stop app in non-clustered environment.

## context

`context` is an object provided for plugins (`use`) or your config function (`config`) that comes with:

context:
  - env: where you can find effective environment variables - `process.env` merged with `env` provided via `start(env)`;
  - app:
    - name: packageJson.name;
    - version: version obtained from ci.
  - newrelic: preconfigured instance of [newrelic](https://www.npmjs.com/package/newrelic).
  - management:
    - addHealthTest: (name, fn): register health tests. fn can be either function that returns value or function that returns `Promise`.
    - addShutdownHook: (name, fn): register hooks that are executed during node process termination/shutdown. fn can be either sync function or a function that returns a `Promise`. 
  - metrics.client: preconfigured instance of [wix-measured](../../private/monitoring/wix-measured);
  - config: preconfigured instance of [wix-config](../../config/wix-config);
  - session: 'wixSession2' decoder.
  - statsd: {host, interval} - statsd configuration.
  - rpc: a preconfigured instance of [wix-json-rpc-client](../../rpc/wix-json-rpc-client);
  - petri:
    - client: preconfigured instance of [wix-petri-client](../../petri/wix-petri-client);
    - addSpecs: forward to [wnp-petri-specs#addSpecs](../../petri/wnp-petri-specs).
  
# Install

```bash
npm install --save wnp-bootstrap-composer
```

# Usage

## Minimal

```js
require('wnp-bootstrap-composer')().start();
```

This will start application that will serve endpoints required for app to conform to ops contract, but will not do much.

## Complete

For real-world usage check source/docs of [wix-bootstrap-ng](../../bootstrap/wix-bootstrap-ng).

# Api

## Composer(options): WixBootstrapComposer
Returns a new instance of `WixBootstrapComposer` that is a builder to compose your app.

Parameters:
 - options - pass-through options for modules used:
  - runner: optional, see explanation below;
  - express:
    - timeout: default timeout for express handlers;
  - health:
    - forceDelay: force delay between execution of health tests;
  - rpc:
    - timeout: timeout for rpc factory.

**options.runner**
It is a function, that given a parameterless function that returns a `Promise` will run it. Provided function is a composed app itself.

```js
const composer = require('wnp-bootstrap-composer');

composer({runner: () => aroundLoggingRunner}).start();

function aroundLoggingRunner(thenable) {
  return Promise.resolve(() => console.log('about to start'))
    .then(thenable)
    .then(() => console.log('ok, booted'));  
}
```

### WixBootstrapComposer.use(object, opts): this
Allows to add a plugin that adds additional objects/functions to a `context`.

This is a way to compose app with additional features like rpc client, petri client, logger, bi...

Parameters:
 - object - mandatory, object containing:
  - di: mandatory, object containing:
    - value: function whose result will be added to `context` under `key`. Function can return a `Promise`.
    - key: string, key upon which `value` will be available on `context`.
    - deps: optional, array of properties that this plugin requires to exist on `context` to initialize itself.
    - bind: set to `false` if you want for `value` to be invoked, but result to not be bound to `context`.
  - opts: object, passed-over to a `plugin.di.value` function as a second argument.
    
```js
const composer = require('wnp-bootstrap-composer');

composer()
  .use(myPlugin())
  .start();

function myPlugin() {
  return {
    di: {
      key: 'someItem',
      value: (context, opts) => Promise.resolve(context.env.PORT + 1)
    }
  }
}
```

This of course can provide more complex objects or functions.

### WixBootstrapComposer.config(fileExportingFunction): this
Allows you to have a config where given a `context` composed from defaults and plugins you can build an object containing functions/objects that match your domian. Returned object will be passed down to `express`, `management`, `http` functions.

Parameters:
 - fileExportingFunction - path (absolute or from cwd) to a js file exporting a function that gets a `context` and returns an thing (object, function, whatever). Can return a `Promise`.

**index.js**

```js
const composer = require('wnp-bootstrap-composer');

composer()
  .config('./lib/config')
  .express('./lib/app')
  .start();
```

**lib/config.js**

```js
module.exports = context => {
  return { port: context.env.port };
}
```

**lib/express-app.js**

```js
module.exports = (app, config) => {
  return app.get('/port', (req, res) => res.send(config.port));
}
```

### WixBootstrapComposer.express(fileExportingFunction): this
Allows you to server express app(s) via on PORT and MOUNT_POINT. Can be called multiple times.
 
Parameters:
 - fileExportingFunction - path (absolute or from cwd) to a js file exporting a function that gets an and preconfigured `express` app and  `config` (given you used `.config('./lib/config')`) and must return either express router or application. Can return a `Promise`.

```js
module.exports = (app, configOrContext) => {
  return app.get('/woop', (req, res) => res.send('woop woop'));
}
```

### WixBootstrapComposer.http(fileExportingFunction): this
Allows you to attach request handlers to `node#httpServer` (ex. you want to serve web-sockets).
 
Parameters:
 - fileExportingFunction - path (absolute or from cwd) to a js file exporting a function that gets an `httpServer` and `config` (given you used `.config('./lib/config')`). Can return a `Promise`.

```js
module.exports = (httpServer, configOrContext) => {
    httpServer.on('request', (req, res) => {...});
}
```
**Note:** don't use it for adding expressjs applications as multiple expressjs applications will not live happily on same httpServer as each of them has default `404` handler.

### WixBootstrapComposer.management(fileExportingFunction): this
Allows you to server express app(s) via on MANAGEMENT_PORT and MOUNT_POINT. Can be called multiple times.
 
Parameters:
 - fileExportingFunction - path (absolute or from cwd) to a js file exporting a function that gets an preconfigured `express` app and `config` (given you used `.config('./lib/config')`) and must return either express router or application. Can return a `Promise`.

```js
module.exports = (app, configOrContext) => {
  return app.get('/woop-on-management', (req, res) => res.send('woop woop'));
}
```

### WixBootstrapComposer.start(opts): Promise
Starts an application and returns a `Promise` with a result(function) that, upon invocation will stop started http servers.

Parameters:
 - opts - optional options with:
   - env - object, containing overrides for environment variables to be used within app.
   - disable - array with parts that can be switched off. Mostly intended for development/testing whereas you might want to run app without cluster (for debugging). Available values:
    - runner - runner  - this will only disable custom `runner` and use default one;

** Note: ** parts to disable can also be controlled via `WIX_BOOT_DISABLE_MODULES` environment variable where values can be same as for `opts.disable` as a comma-separated list, ex 'runner, express';