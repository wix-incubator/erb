# wnp-bootstrap-session

[wix-bootstrap-ng](../../bootstrap-ng/wix-bootstrap-ng) plugin that adds `session` to a `context` where `session` is a preconfigured instance of [wix-session-crypto](../../security/wix-session-crypto). 

This plugin comes bundled with [wix-bootstrap-ng](../../bootstrap-ng/wix-bootstrap-ng) or can be plugged-in to [wnp-bootstrap-composer](../wnp-bootstrap-composer) via `use`, but it depends on [wnp-bootstrap-config](../wnp-bootstrap-config) to be within context. 

## development/production modes

This module detects run mode (NODE_ENV) and depending on:
 - development - does not load config, but instead uses preconfigured session key from [wix-session-crypto](../../security/wix-session-crypto).devKeys
 - production - loads keys from config (see `./templates`). 

Module supports config overrides via environment variable. Given environment variables are provided, config will not be loaded. Environment variable:
 - WIX-BOOT-SESSION-MAIN-KEY

## install

```bash
npm install --save wnp-bootstrap-session 
```

## usage

Given you are developing a `bootstrap`-based app, you can access `session` within your bootstrap config file:

**index.js**

```js
const bootstrap = require('wix-bootstrap-ng');

bootstrap()
  .config('./lib/config')
  .start();
```

**lib/config.js**

```js
module.exports = context => {
  return {
    session: context.session
  };
};
```

## api
### di
Returns an object autowire-able to [wix-bootstrap-ng](../../bootstrap-ng/wix-bootstrap-ng).