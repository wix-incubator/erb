# wix-bootstrap-config

Module containing [wix-bootstrap](../wix-bootstrap) config templates and responsible for loading/validating configs.

Can also be used in building custom docker images to run 'wix-bootstrap'-based apps.

It uses [wix-run-mode](../../utils/wix-run-mode) to detect if app is running in prod or not. If it's running in 'dev' mode, it will inject stub-values so that you don't need `wix-bootstrap.json` during development.

# Install

```
npm install --save wix-bootstrap-config
```

# Usage

Given use have environment variable 'APP_CONF_DIR' set and 'wix-bootstrap.json' available there, you can do:

```js
const wixBootstrapConfig = require('wix-bootstrap-config').load();
```

Or otherwise you can provide partial/complete object and then no loading from file-system will be performed:

```js
const completeConfigObj = {...};
const wixBootstrapConfig = require('wix-bootstrap-config').load(completeConfigObj);
```

Intended to allow overriding some of the config by app or to support environments where wix-bootstrap config is not available.

# Api

## load(options)
Loads config. This function have 3 main ways to be invoked:
 1. `load()` - config loaded from file given you have `APP_CONF_DIR/wix-bootstrap.json` with full configuration;
 2. `load(partial)` - given you have `APP_CONF_DIR/wix-bootstrap.json`, but want to override some values programatically;
 3. `load(full)` - given you don't want to use configuration file, but are providing full configuration programatically.

Configuration object has following properties:
 - express
  - requestTimeout, int, ms - default request timeout for requests;
 - session
  - mainKey - string, main key used for wix session decoding;
  - alternateKey - string, fallback key used for wix session decoding;
 - rpc
  - signingKey - string, key used to sign rpc requests;
  - defaultTimeout - int, ms, default rpc call timeout.
 requestContext
  - seenByInfo - encrypted string to be prepended to the X-Seen-By header.
  

Example:

```js
{
  express: {
    requestTimeout: 1000
  },
  session: {
    mainKey: 'kukuriku_1111111',
    alternateKey: 'kukuriku_1111112'
  },
  rpc: {
    signingKey: '1234567890',
    defaultTimeout: 6000
  },
  requestContext: {
    seenByInfo: 'seen-by-component'
  }  
}
```