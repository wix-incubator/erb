# wix-bootstrap

TBD

# Install

```
npm install --save wix-bootstrap
```

# Usage

TBD

# Api

## setup(options)

Configures global `wix-bootstrap` instance. This function have 3 main ways to be invoked:
 1. not invoked given you have `APP_CONF_DIR/wix-bootstrap.json` with full configuration;
 2. `setup()` - with no args is same as #1.
 3. `setup(partial)` - given you have `APP_CONF_DIR/wix-bootstrap.json`, but want to override some values programatically;
 4. `setup(full)` - given you don't want to use configuration file, but are providing full configuration programatically.

## rpcClient(url, timeout)

## run(appFn)

Runs a provided `wix-bootstrap`-compliant function.

appFn - mandatory, function that takes `express` app as an argument and returns augmented (added routes/gets/middlewares).

```js
module.exports = app => {
  app.get('/', (req, res) => res.end());
  app.use(require('some-middleware-func'));

  return app;
};
```