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
Configures global `wix-bootstrap` instance. 

For details on configuration structure and capabilities please see [wix-bootstrap-config](../wix-bootstrap-config).

## rpcClient(parts...)
Returns a [rpc-client](/rpc/json-rpc-client) ready for accessing wix-based rpc servers.

## express(appFile)
Runs a provided `wix-bootstrap`-compliant .js file exporting function in a form of: `express => {};` where arguments are:
 - express - an [express](http://expressjs.com/en/index.html) instance which:
  - is pre-wired with essential middlewares that must be before any of your routes/handlers/custom middlewares;
  - will be post-wired with other bunch of middlewares that must go last;
  - will have infrastructure-related resources/endpoints wired-in (say 'health/is_alive') which are necessary both for master process and infra;
  - will be started on `MOUNT_POINT` context path and `PORT` port.

Returns optionals promise. Given promise is returned, start-up of app is delayed until promise is fulfilled.

Example of appFn - `./lib/express.js`:

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

## run(appFn)

**deprecated**

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