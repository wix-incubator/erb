# wix-express-require-login

Express.js middlewares for handling authorization with wixSession (via [wix-session-aspect](../../aspects/wix-session-aspect)).

## install

```bash
npm install --save wix-express-require-login
```

## usage

```js
const express = require('express'),
  WixExpressRequireLogin = require('wix-express-require-login');
  
const app = express();

const urlResolver = (req) => 'www.example.com';
const requireLogin = new WixExpressRequireLogin(urlResolver);

// express routes
app.get('/required-login-with-forbid', requireLogin.forbid(), (req, res) => {
  res.sendStatus(200);
});

app.get('/required-login-with-redirect', requireLogin.redirect(), (req, res) => {
  res.sendStatus(200)
});

app.get('/required-login-with-custom-redirect', requireLogin.redirect('http://custom-url'), (req, res) => {
  res.sendStatus(200)
});

app.get('/required-login-with-custom-redirect-resolver', requireLogin.redirect(req => 'http://custom-url-resolver'), (req, res) => {
  res.sendStatus(200)
});
```

## API

## new WixExpressRequireLogin(urlResolver: req => string, [validation: req => Promise])
Creates a new instance of [WixExpressRequireLogin](./index.js) class

######parameters
- `urlResolver: req => string` - mandatory; function from incoming request to a string. used to calculate the redirect url
- `validation: (req, res) => Promise` - optional; additional validation check to execute on incoming request in case the wixSession exists

## WixExpressRequireLogin#forbid()
Returns an express middleware, which rejects incoming request if no session exists or if the existing session fails the validation.

## WixExpressRequireLogin#redirect([url || urlResolver])
Returns an express middleware, which redirects to URL if no session exists or if the existing session fails the validation.

######parameters
- `url: string` - optional; custom URL to use for the redirect. If given, the `urlResolver` will not be used.
- `urlResolver: req => string` - optional; custom URL resolver to use for the redirect. If given, the `urlResolver` will not be used.



