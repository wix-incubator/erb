# wix-bootstrap-gatekeeper

A [wix-bootstrap-ng](../wix-bootstrap-ng) plugin that provides you a preconfigured instance of [wix-gatekeeper-client](../../gatekeeper/wix-gatekeeper-client).

## development/production modes

This module detects run mode (NODE_ENV) and depending on:
 - development - does not load config, but instead uses gatekeeper testkit server url: `http://localhost:3029`.
 - production - loads service url from config (see `./templates`). 

Module supports config overrides via environment variables. Given environment variables are provided, config will not be loaded. Environment variables:
 - WIX_BOOT_GATEKEEPER_URL;

## install

```bash
npm install --save wix-bootstrap-gatekeeper
```

## usage

Given you are developing a `bootstrap`-based app, you can access `gatekeeper` within your bootstrap config file:

**index.js**

```js
const bootstrap = require('wix-bootstrap-ng');

bootstrap()
  .use(require('wix-bootstrap-gatekeeper'))
  .config('./lib/config')
  .express('./lib/express-app')
  .start();
```

**lib/config.js**

```js
module.exports = context => {    
  return {
    gatekeeper: aspects => context.gatekeeper.client(aspects),
    gatekeeperMiddleware: permission => context.gatekeeper.middleware(permission)
  };
};
```

**lib/express-express-app.js**

###### Using gatekeeper client

```js
module.exports = (app, config) => {
  
  app.get('/gatekeeper', (req, res, next) => {
    const gatekeeper = config.gatekeeper(req.aspects);
    gatekeeper.authorize('metasiteId', {scope: 'permissionScope', action: 'permissionAction'})
      .then(() => res.end())
      .catch(next);
  });

  return app;
};
```

###### Using gatekeeper middleware

```js
module.exports = (app, config) => {
  
  const permission = {scope: 'permissionScope', action: 'permissionAction'};
  const gkMiddleware = config.gatekeeperMiddleware(permission);
  
  app.get('/gatekeeper-protected', gkMiddleware(req => req.params['msId']), (req, res) => {
    res.send('ok');
  });
  
  return app;
};
```

## api

`context.gatekeeper` returns you a preconfigured instance of [wix-gatekeeper-client](../../gatekeeper/wix-gatekeeper-client).factory().

`context.middleware` returns you a `gatekeeper` middleware.
