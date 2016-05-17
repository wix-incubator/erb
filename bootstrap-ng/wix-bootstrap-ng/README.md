# wix-bootstrap-ng

Main module for running your node app in a `wixy` way.

# Run modes

'wix-bootstrap' app is environment aware and supports dev/prod run modes. It uses [wix-run-mode](../../utils/wix-run-mode) module to tell it if app is running in production mode or not. Differences:
 - production mode - app is strict about required configs and environment variables being present and fails-fast if any of them missing.
 - dev mode - app uses defaults for configs and environments variables given they are missing.

## Environment variables

App depends on following environment variables:
This module depends on environment variables:
 - PORT - main app port;
 - MANAGEMENT_PORT - management app port;
 - APP_CONF_DIR - folder where configs are located;
 - MOUNT_POINT - app mount point;
 - APP_TEMPL_DIR - folder where config tempaltes (.erb) are located;
 - APP_LOG_DIR - log folder;
 - HOSTNAME - hostname.

In development mode missing app-specific environment variables are set to:
 - PORT: 3000
 - MANAGEMENT_PORT: 3004,
 - MOUNT_POINT: '',
 - APP_CONF_DIR: './test/configs',
 - APP_TEMPL_DIR: './templates',
 - APP_LOG_DIR: './target/logs',
 - HOSTNAME: 'localhost',

Also, new relic is disabled for non-production run-mode using environment variables:
 - NEW_RELIC_ENABLED: false,
 - NEW_RELIC_NO_CONFIG_FILE: true,
 - NEW_RELIC_LOG: 'stdout'

## defaults in `context`

`context` is an object provided to you as an argument for `config` function, where you can find both some defaults and pre-wired modules.

**env** with keys:
 - port: process.env.PORT;
 - managementPort: process.env.MANAGEMENT_PORT;
 - mountPoint: process.env.MOUNT_POINT;
 - logDir: process.env.APP_LOG_DIR;
 - confDir: process.env.APP_CONF_DIR;
 - templDir: process.env.APP_TEMPL_DIR;
 - hostname: process.env.HOSTNAME.

**app** with keys:
 - name: packageJson.name;
 - version: packageJson.version.

**newrelic** - preconfigured instance of [newrelic](https://www.npmjs.com/package/newrelic).

## bundled plugins

 - session: prewired [wnp-bootstrap-session](../../composer/wnp-bootstrap-session) module;
 - config: prewired [wnp-bootstrap-config](../../composer/wnp-bootstrap-config) module.

# Install

```
npm install --save wix-bootstrap-ng
```

# Usage

Please see [Bootstrap Documentation](..) for a complete example and example app [das-boot-ng](../das-boot-ng).

# Api

## (): WixBootstrapNg
Returns an app builder.

### WixBootstrapNg.use(object, opts): this
Allows to add a plugin that adds additional objects/functions to a `context`, example plugins:
 - [wix-bootstrap-rpc](../wix-bootstrap-rpc);
 - [wix-bootstrap-bi](../wix-bootstrap-bi);
 
### WixBootstrapNg.config(fileExportingFunction): this
Allows you to have a config where given a `context` composed from defaults and plugins you can build an object containing functions/objects that match your domain. Returned object will be passed down to `express`, `management`, `http` functions.
 
Parameters:
 - fileExportingFunction - js file exporting a function that gets a `context` and returns an thing (object, function, whatever). Can return a `Promise`.

**index.js**

```js
const bootstrap = require('wix-bootstrap-ng');

bootstrap()
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

module.exports = () => {
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
module.exports = httpServer => {
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

### WixBootstrapComposer.start(): Promise
Starts an application and returns a `Promise` with a result(function) that, upon invocation will stop started http servers.