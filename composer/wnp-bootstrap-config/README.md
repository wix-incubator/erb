# wnp-bootstrap-config

[wnp-bootstrap-composer](../wnp-bootstrap-composer) plugin that adds `config` to a `context` where `config` is a preconfigured instance of [wix-config](../../config/wix-config). 

This plugin comes bundled with [wix-bootstrap-ng](../wix-bootstrap-ng) or can be plugged-in to [wnp-bootstrap-composer](../wnp-bootstrap-composer) via `use`. 

## install

```bash
npm install --save wnp-bootstrap-config
```

## usage

Given you are developing a `bootstrap`-based app, you can access `config` within your bootstrap config file:

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
  const myConfig = context.config.load('my-config');

  ...

  return {
    appConfig: myConfig
  };
};
```

## api
### di
Returns an object autowire-able to [wnp-bootstrap-composer](../wnp-bootstrap-composer).