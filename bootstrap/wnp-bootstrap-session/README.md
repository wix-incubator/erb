# wnp-bootstrap-session

[wix-bootstrap](../wix-bootstrap) plugin that adds `session` to a `context` where `session` is a preconfigured instance of [wix-session-crypto](../../security/wix-session-crypto). 

This plugin comes bundled with [wix-bootstrap](../wix-bootstrap) or can be plugged-in to [wnp-bootstrap-composer](../wnp-bootstrap-composer) via `use`, but it depends on [wnp-bootstrap-config](../wnp-bootstrap-config) to be within context. 

## development/production modes

This module detects run mode (NODE_ENV) and depending on:
 - development - does not load config, but instead uses preconfigured session key from [wix-session-crypto](../../security/wix-session-crypto).devKeys
 - production - loads keys from config (see `./templates`). 

Module supports config overrides via environment variables. Given environment variables are provided, config will not be loaded. Environment variables:
 - WIX-BOOT-SESSION-MAIN-KEY
 - WIX-BOOT-SESSION-ALTERNATE-KEY

## install

```bash
npm install --save wnp-bootstrap-session 
```

## usage

Given you are developing a `bootstrap`-based app, you can access `session` within your bootstrap config file:

**index.js**

```js
const bootstrap = require('wix-bootstrap');

bootstrap()
  .config('./lib/config')
  .start();
```

**lib/config.js**

```js
module.exports = context => {
  const session = context.session; //preconfigured wix-session-crypto module.

  ...

  return {
    session: session
  };
};
```

## api

### (env, config)
Returns an instance of [wix-config](../../config/wix-config);

### di
Returns an object autowire-able to [wix-bootstrap](../wix-bootstrap).