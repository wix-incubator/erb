# wnp-bootstrap-composer

Module for composing an wix'y app that provides following features:
 - aware of environment variables for main/management app listening ports and mount-points;
 - allows to plugin-in custom main/management express apps;
 - allows to add plugins;
 - gives convenience structure for structuring app - config, express, http, management;
 - fully pluggable - main express app wrapper, management express app wrapper, custom runner (ex. clustered);

This module depends on environment variables:
 - PORT - main app port;
 - MANAGEMENT_PORT - management app port;
 - APP_CONF_DIR - folder where configs are located;
 - MOUNT_POINT - app mount point;
 - APP_TEMPL_DIR - folder where config tempaltes (.erb) are located;
 - APP_PERSISTENT_DIR - folder where files are retained between docker container restarts; 
 - APP_LOG_DIR - log folder;
 - HOSTNAME - hostname.

## context

`context` is an object provided for plugins (`use`) or your config function (`config`) that comes with defaults:

**env** - where you can find effective environment variables - `process.env` merged with `env` provided via `start(env)`;

**app** with keys:
 - name: packageJson.name;
 - version: packageJson.version.

**newrelic** - preconfigured instance of [newrelic](https://www.npmjs.com/package/newrelic).

# Install

```
npm install --save wnp-bootstrap-composer
```

# Usage

## Minimal

```js
require('wnp-bootstrap-composer')().start();
```

This will start application that will serve endpoints required for app to conform to ops contract, but will not do much.

## Complete

For real-world usage check source/docs of [wix-bootstrap-ng](../../bootstrap-ng/wix-bootstrap-ng).

# Api

## Composer(options): WixBootstrapComposer
Returns a new instance of `WixBootstrapComposer` that is a builder to compose your app.

Parameters:
 - options - object, optional with keys:
   - runner: optional, see explanation below;
   - composers:
     - mainExpress - optional, see explanation below; 
     - managementExpress - optional, see explanation below. 

**options.composers.mainExpress**

It is a function, that given prebuilt context(with plugins provided via `use()`) and list of expressjs apps (applications or routers) must return a composed expressjs application that is mounted on `http://localhost:PORT/MOUNT_POINT`.

```js
const composer = require('wnp-bootstrap-composer'),
 express = require('express');

composer({composers: {mainExpress: () => myComposer}}).start();

function myComposer(context, apps) {
    container = express();
    apps.forEach(app => express.use(app));
    return container;
}
```

Function can return a promise.

This function can do more things of course - middlewares, remapping path, etc.

**options.composers.managementExpress**

Same as `options.composers.mainExpress` but for management app.

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
 - fileExportingFunction - js file exporting a function that gets a `context` and returns an thing (object, function, whatever). Can return a `Promise`.

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
const express = require('express');

module.exports = config => {
  return express
    .Router()
    .get('/port', (req, res) => res.send(config.port));    
}
```

### WixBootstrapComposer.express(fileExportingFunction): this
Allows you to server express app(s) via on PORT and MOUNT_POINT. Can be called multiple times.
 
Parameters:
 - fileExportingFunction - js file exporting a function that gets an `config` (given you used `.config('./lib/config')`) and must return either express router or application. Can return a `Promise`.

```js
const express = require('express');

module.exports = configOrContext => {
  const app = express.Router()
    .get('/woop', (req, res) => res.send('woop woop'));
  
  return app;
}
```

### WixBootstrapComposer.http(fileExportingFunction): this
Allows you to attach request handlers to `node#httpServer` (ex. you want to serve web-sockets).
 
Parameters:
 - fileExportingFunction - js file exporting a function that gets an `httpServer` and `config` (given you used `.config('./lib/config')`). Can return a `Promise`.

```js
module.exports = (httpServer, configOrContext) => {
    httpServer.on('request', (req, res) => {...});
}
```
**Note:** don't use it for adding expressjs applications as multiple expressjs applications will not live happily on same httpServer as each of them has default `404` handler.

### WixBootstrapComposer.management(fileExportingFunction): this
Allows you to server express app(s) via on MANAGEMENT_PORT and MOUNT_POINT. Can be called multiple times.
 
Parameters:
 - fileExportingFunction - js file exporting a function that gets an `config` (given you used `.config('./lib/config')`) and must return either express router or application. Can return a `Promise`.

```js
const express = require('express');

module.exports = () => {
  const app = express.Router()
    .get('/woop-on-management', (req, res) => res.send('woop woop'));
  
  return app;
}
```

### WixBootstrapComposer.start(opts): Promise
Starts an application and returns a `Promise` with a result(function) that, upon invocation will stop started http servers.

Parameters:
 - opts - optional options with:
   - env - object, containing overrides for environment variables to be used within app.
   - disable - array with parts that can be switched off. Mostly intended for development/testing whereas you might want to run app without cluster (for debugging). Available values:
    - runner - runner  - this will only disable custom `runner` and use default one;
    - express - express app composer - this will only disable custom `composers.mainExpress` and use default one;
    - management - management app composer - this will only disable custom `composers.managementExpress` and use default one;