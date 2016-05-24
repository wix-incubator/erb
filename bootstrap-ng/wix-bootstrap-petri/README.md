# wix-bootstrap-petri

A [wix-bootstrap-ng](../wix-bootstrap-ng) plugin that provides you a preconfigured instance of [wix-petri-client](../../petri/wix-petri-client).

## development/production modes

This module detects run mode (NODE_ENV) and depending on:
 - development - does not load config, but instead uses petri server url: `http://localhost:3020`.
 - production - loads service url from config (see `./templates`). 

Module supports config overrides via environment variables. Given environment variables are provided, config will not be loaded. Environment variables:
 - WIX-BOOT-LABORATORY-URL;

## install

```bash
npm install --save wix-bootstrap-petri
```

## usage

Given you are developing a `bootstrap`-based app, you can access `petri` within your bootstrap config file:

**index.js**

```js
const bootstrap = require('wix-bootstrap-ng');

bootstrap()
  .use(require('wix-bootstrap-petri'))
  .config('./lib/config')
  .express('./lib/express-app')
  .start();
```

**lib/config.js**

```js
module.exports = context => {
  return {
    petri: aspects => context.petri.client(aspects)
  };
};
```

**lib/express-express-app.js**

```js
const express = require('express');

module.exports = config => {
  const app = new express.Router();
  
  app.get('/petri', (req, res, next) => {
  const petri = config.petri(req.aspects);
    petri.conductExperiment('ft', false)
      .then(ftResult => res.send(ftResult))
      .catch(next);
  });

  return app;
};
```

## api

`context.petri` returns you a preconfigured instance of [wix-petri-client](../../petri/wix-petri-client).factory().
