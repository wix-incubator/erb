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
 - APP_PERSISTENT_DIR - folder where data is persisted between restarts; 
 - APP_LOG_DIR - log folder;
 - HOSTNAME - hostname.

In development mode missing app-specific environment variables are set to:
 - PORT: 3000
 - MANAGEMENT_PORT: 3004,
 - MOUNT_POINT: '',
 - APP_CONF_DIR: './test/configs',
 - APP_TEMPL_DIR: './templates',
 - APP_PERSISTENT_DIR: './target/persistent',
 - APP_LOG_DIR: './target/logs',
 - HOSTNAME: 'localhost',

Also, new relic is disabled for non-production run-mode using environment variables:
 - NEW_RELIC_ENABLED: false,
 - NEW_RELIC_NO_CONFIG_FILE: true,
 - NEW_RELIC_LOG: 'stdout'

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
  - metrics: preconfigured instance of [wix-measured](../../private/monitoring/wix-measured).

## bundled plugins

 - session: prewired [wnp-bootstrap-session](../../composer/wnp-bootstrap-session) module;
 - config: prewired [wnp-bootstrap-config](../../composer/wnp-bootstrap-config) module.
 - statsd: prewired [wnp-bootstrap-statsd](../../composer/wnp-bootstrap-statsd) module.

# Install

```bash
npm install --save wix-bootstrap-ng
```

# Usage

Please see [Bootstrap Documentation](..) for a complete example and example app [das-boot-ng](../das-boot-ng).

# Api

## (options): WixBootstrapNG
Returns an app builder.

Parameters:
 - options - pass-through options for modules used:
  - express - pass-through to [wnp-bootstrap-express](../../composer/wnp-bootstrap-express).

Example options:
```js
{
  express: {
    timeout: 4000
  }
}
```

### WixBootstrapNg.use(object, opts): this
Allows to add a plugin that adds additional objects/functions to a `context`, example plugins:
 - [wix-bootstrap-rpc](../wix-bootstrap-rpc);
 - [wix-bootstrap-bi](../wix-bootstrap-bi);
 
### WixBootstrapNg.config(fileExportingFunction): this
Allows you to have a config where given a `context` composed from defaults and plugins you can build an object containing functions/objects that match your domain. Returned object will be passed down to `express`, `management`, `http` functions.
 
Parameters:
 - fileExportingFunction - path (absolute or from cwd) to a js file exporting a function that gets a preconfigured `express` app and `context` and returns an thing (object, function, whatever). Can return a `Promise`.

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
module.exports = (app, config) => {
  return app.get('/port', (req, res) => res.send(config.port));
}
```

** Note: ** `config` is optional, and if you won't explicitly use it, `context` will be passed-over directly to your `express`, `http` handlers.

### WixBootstrapComposer.express(fileExportingFunction): this
Allows you to server express app(s) via on PORT and MOUNT_POINT. Can be called multiple times.
 
Parameters:
 - fileExportingFunction - path (absolute or from cwd) to a js file exporting a function that gets a preconfigured `express` app and `config` (given you used `.config('./lib/config')`) and must return either express router or application. Can return a `Promise`.

```js
module.exports = (app, config) => {
  return app.get('/woop', (req, res) => res.send('woop woop'));
}
```

### WixBootstrapComposer.http(fileExportingFunction): this
Allows you to attach request handlers to `node#httpServer` (ex. you want to serve web-sockets).
 
Parameters:
 - fileExportingFunction - path (absolute or from cwd) to a js file exporting a function that gets an `httpServer` and `config` (given you used `.config('./lib/config')`). Can return a `Promise`.

```js
module.exports = httpServer => {
    httpServer.on('request', (req, res) => {...});
}
```
**Note:** don't use it for adding expressjs applications as multiple expressjs applications will not live happily on same httpServer as each of them has default `404` handler.

### WixBootstrapComposer.management(fileExportingFunction): this
Allows you to server express app(s) via on MANAGEMENT_PORT and MOUNT_POINT. Can be called multiple times.
 
Parameters:
 - fileExportingFunction - path (absolute or from cwd) to a js file exporting a function that gets a preconfigured `express` app and `config` (given you used `.config('./lib/config')`) and must return either express router or application. Can return a `Promise`.

```js
module.exports = () => {
  return app.get('/woop-on-management', (req, res) => res.send('woop woop'));
}
```

### WixBootstrapComposer.start(opts): Promise
Starts an application and returns a `Promise` with a result(function) that, upon invocation will stop started http servers.

Parameters:
 - opts:
   - env - object, containing environment key/values pairs that will be set within your apps `context` merged with `process.env`;
   - express:
     - timeout - timeout effective as default for all express apps.
