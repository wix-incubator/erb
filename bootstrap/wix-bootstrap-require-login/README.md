# wix-bootstrap-require-login

A [wix-bootstrap-ng](../wix-bootstrap-ng) plugin that provides you a preconfigured instance of [wix-express-require-login](../../security/wix-express-require-login) middleware.

## Development/production modes

Module supports config overrides via environment variables. Given environment variable `WIX_BOOT_LOGIN_URL` is provided, config will not be loaded.

## Install

```bash
npm install --save wix-bootstrap-require-login
```

## Usage

Given you are developing a `bootstrap`-based app, you can access `requireLogin` within bootstrap context:

**index.js**

```js
const bootstrap = require('wix-bootstrap-ng');

bootstrap()
  .use(require('wix-bootstrap-require-login'))
  .express('./express-app')
  .start();
```

**express-app.js**

```js
module.exports = (app, context) => {
  app.get('/required-login-with-forbid-resource', context.requireLogin.forbid, (req, res) => {
    res.sendStatus(200);
  });
  
  app.get('/required-login-with-redirect-resource', context.requireLogin.redirect, (req, res) => {
    res.sendStatus(200);
  });
  
  return app;
};
```

## API

### `context.requireLogin.forbid`
Returns a response with an `HTTP 401` status if the user is not authenticated. Otherwise, it passes the request through.

### `context.requireLogin.redirect`
Redirects the user to the URL preconfigured in the config, which can be overridden through `ENV` variable. It also inserts the return URL as a query parameter by taking the value of `req.aspects['web-context'].url`.
