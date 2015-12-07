# wix-bootstrap

Main module for running your node app in a `wixy` way.

# Install

```
npm install --save wix-bootstrap
```

# Usage

Please see [Bootstrap 'Getting started'](../#getting-started) for a complete example.

# Api

## setup(options)
Configures global `wix-bootstrap` instance. This function have 3 main ways to be invoked:
 1. not invoked given you have `APP_CONF_DIR/wix-bootstrap.json` with full configuration;
 2. `setup()` - with no args is same as #1.
 3. `setup(partial)` - given you have `APP_CONF_DIR/wix-bootstrap.json`, but want to override some values programatically;
 4. `setup(full)` - given you don't want to use configuration file, but are providing full configuration programatically.

## rpcClient(url, timeout)
Returns a [rpc-client](/rpc/json-rpc-client) ready for accessing wix-based rpc servers.

## run(appFn)
Runs a provided `wix-bootstrap`-compliant function in a form of: `(express, done) => {...; done();};` where arguments are:
 - express - an [express](http://expressjs.com/en/index.html) instance which:
  - is pre-wired with essential middlewares that must be before any of your routes/handlers/custom middlewares;
  - will be post-wired with other bunch of middlewares that must go last;
  - will have infrastructure-related resources/endpoints wired-in (say 'health/is_alive') which are necessary both for master process and infra;
  - will be started on `MOUNT_POINT` context path and `PORT` port.
 - done - callback which you HAVE TO call with no args in case of success init or error in case you encountered some failures.

Example of appFn - `./lib/app.js`:

```js
module.exports = (app, done) => {
  app.get('/', (req, res) => res.end());
  app.use(require('some-middleware-func'));
  done();
};
```

Example or related run - `./index.js`:

```js
require('wix-bootstrap').run(() => require('./lib/app'));
```

Note that doing a late-require './lib/app' is important - read-up at [bootstrap](../).