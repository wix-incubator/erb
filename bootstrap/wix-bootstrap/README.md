# wix-bootstrap

Main module for running your node app in a `wixy` way.

# Run modes

'wix-bootstrap' app is environment aware and supports dev/prod run modes. It uses [wix-run-mode](../../utils/wix-run-mode) module to tell it if app is running in production mode or not. Differences:
 - production mode - app is strict about required configs and environment variables being present and fails-fast if any of them missing.
 - non-production mode - app uses defaults for configs and environments variables given they are missing.

## Environment variables

App depends on following environment variables:
 - PORT - port on which expess/websockets apps will be listening;
 - MANAGEMENT_PORT - port on which management app will be listening (app-info, health-checks); 
 - MOUNT_POINT - path where expess/websockets/management apps will be served on;
 - APP_CONF_DIR - folder to look for configs in.

In development mode missing app-specific environment variables are set to:
 - PORT: 3000,
 - MANAGEMENT_PORT: 3004,
 - MOUNT_POINT: '',
 - APP_CONF_DIR: './test/configs',

Also, new relic is disabled for non-production run-mode using environment variables:
 - NEW_RELIC_ENABLED: false,
 - NEW_RELIC_NO_CONFIG_FILE: true,
 - NEW_RELIC_LOG: 'stdout'

## Configs

App depends on config:
 - 'wix-bootstrap.json' - see [wix-bootstrap-config](../wix-bootstrap-config) for details.

For development stub config from [wix-bootstrap-config](../wix-bootstrap-config) is used as a fallback, though precedence is given if config file exists or configuration is being overriden via `setup(opts)`;

# Install

```
npm install --save wix-bootstrap
```

# Usage

Please see [Bootstrap 'Getting started'](../#getting-started) for a complete example.

# Api

## setup(options)
Configures global `wix-bootstrap` instance. 

For details on configuration structure and capabilities please see [wix-bootstrap-config](../wix-bootstrap-config).

## rpcClient(parts...)
Returns a [wix-json-rpc-client](/rpc/wix-json-rpc-client) ready for accessing wix-based rpc servers.

## express(appFile)
Runs a provided `wix-bootstrap`-compliant .js file exporting function in a form of: `express => {};` where arguments are:
 - express - an [express](http://expressjs.com/en/index.html) instance which:
  - is pre-wired with essential middlewares that must be before any of your routes/handlers/custom middlewares;
  - will be post-wired with other bunch of middlewares that must go last;
  - will have infrastructure-related resources/endpoints wired-in (say 'health/is_alive') which are necessary both for master process and infra;
  - will be started on `MOUNT_POINT` context path and `PORT` port.

Returns optionals promise. Given promise is returned, start-up of app is delayed until promise is fulfilled.

Example of appFn - `./lib/express-app.js`:

```js
module.exports = express => {
  app.use(require('some-middleware-func'));
  app.get('/', (req, res) => res.end());  
};
```

Example or related bootstrap entry point - `./index.js`:

```js
require('wix-bootstrap').express('./lib/express').start();
```

## ws(appFile)
Runs a provided `wix-bootstrap`-compliant .js file exporting function in a form of: `wss => {};` where arguments are:
 - wss - an [ws](https://www.npmjs.com/package/ws) instance which:
  - will be started on `MOUNT_POINT` context path and `PORT` port.

Returns optionals promise. Given promise is returned, start-up of app is delayed until promise is fulfilled.

Example of appFn - `./lib/ws.js`:

```js
module.exports = wss => {
  wss.on('connection', ws => {
    ws.on('message', message => ws.send(message));
  });
};
```

Example or related bootstrap entry point - `./index.js`:

```js
require('wix-bootstrap').ws('./lib/ws').start();
```

## addShutdownHook(fn)
Register a function that will be executed upon worker shutdown. Note that function will be given some time (dependant on configuation) and will be terminated if it will take too long. 

You can register multiple shutdown hooks.