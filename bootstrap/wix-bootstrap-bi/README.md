# wix-bootstrap-bi

A [wix-bootstrap-ng](../wix-bootstrap-ng) plugin that provides you a preconfigured instance of [wix-bi-logger-client](https://github.com/wix-private/bi-logger/tree/master/bi-logger-client).

## install

```bash
npm install --save wix-bootstrap-bi
```

## usage

Given you are developing a `bootstrap`-based app, you can access `bi` within your bootstrap config file:

**index.js**

```js
const bootstrap = require('wix-bootstrap-ng');

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

  return {
    bi: aspects => bi.logger(aspects)
  };
};
```

**lib/express-express-app.js**

```js
module.exports = (app, config) => {

  app.get('/bi/:id', (req, res, next) => {
    const bi = config.bi(req.aspects);
    bi.log({evtId: req.params.id})
      .then(() => res.end())
      .catch(next);
  });

  return app;
};
```

## api

`context.bi` returns you a preconfigured instance of [wix-bi-logger-client](https://github.com/wix-private/bi-logger/tree/master/bi-logger-client).factory().
