# wix-bootstrap-require-login

A [wix-bootstrap-ng](../wix-bootstrap-ng) plugin that provides you a pre-configured instance of [wix-express-require-login](../../security/wix-express-require-login) middleware.
This middleware takes care of the authorization via wixSession mechanism.

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
  
    app.get('/required-login-with-forbid-resource', context.requireLogin.forbid(), (req, res) => {
    res.sendStatus(200);
  });
  
  // redirect to wix login page
  app.get('/required-login-with-redirect-resource', context.requireLogin.redirect(), (req, res) => {
    res.sendStatus(200);
  });
  
  // redirect to given URL
  app.get('/required-login-with-redirect-resource', context.requireLogin.redirect('http://my-custom-login/'), (req, res) => {
    res.sendStatus(200);
  });
  
  // redirect to calculated URL
  app.get('/required-login-with-redirect-resource', context.requireLogin.redirect(req => 'http://my-custom-login/?lang=' + req.aspects['web'].language), (req, res) => {
    res.sendStatus(200);
  });
  
  return app;
};
```

## API

### `context.requireLogin.forbid()`
Returns a response with an `HTTP 401` status if the user is not authenticated. Otherwise, it passes the request through.

### `context.requireLogin.redirect([str|request => str])`
Redirects the user to the login/sign-up URL.

- If no argument provided, the URL is calculated from base URI provided in the configuration (can be overridden 
in non-production setup through `WIX_BOOT_LOGIN_URL` environment variable) by appending redirect back URL query string 
parameter, language code and other parameters, as required by WIX echo system.
- If string argument given, then the value is taken for URL.
- If function argument given, it will be called with the incoming `request`. The returned `string` will be taken for URL.

