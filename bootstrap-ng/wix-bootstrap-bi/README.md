# wix-bootstrap-bi

A `wix-bootstrap` plugin that you can use via `use` and that provides you a preconfigured instance of [wix-bi-logger-client](../../bi/wix-bi-logger-client).

## install

```bash
npm i -S wix-bootstrap-bi
```

## usage

## usage

Given you are developing a `bootstrap`-based app, you can access `bi` within your bootstrap config file:

**index.js**

```js
const bootstrap = require('wix-bootstrap');

bootstrap()
  .use(require('wix-bootstrap-bi'))  
  .config('./lib/config')
  .express('./lib/express-app')
  .start();
```

**lib/config.js**

```js
module.exports = context => {
  const bi = context.bi;
  bi.setDefaults({src: 5});

  return {biLogger: aspects => bi.logger(aspects)};
};
```

**lib/express-express-app.js**

```js
const express = require('express');

module.exports = config => {
  const app = new express.Router();
  
  app.get('/bi/:id', (req, res, next) => {
    config.biLogger({}).log({evtId: req.params.id})
      .then(() => res.end())
      .catch(next);
  });

  return app;
};
```

## api

`context.bi` returns you a preconfigured instance of [wix-bi-logger-client](../../bi/wix-bi-logger-client).factory().
