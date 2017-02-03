# wix-express-require-login

This module provides express middleware to require login.

## install

```bash
npm install --save wix-express-require-login
```

## usage

```js

const express = require('express'),
  {requireLogin, forbid, redirect} = require('wix-express-require-login');
  
const app = express();


const forbidUnauthenticated = requireLogin(forbid);

app.get('/required-login-with-forbid', forbidUnauthenticated, (req, res) => {
  res.sendStatus(200);
});

const urlResolver = (req) => 'www.example.com';
const redirectUnauthenticated = requireLogin(redirect(urlResolver));

app.get('/required-login-with-redirect', redirectUnauthenticated, (req, res) => {
  res.sendStatus(200)
});
```

## API

## requireLogin(noLoginHandler)
- Arguments (mandatory): `noLoginHandler: (req, res, next) => ()`

Invokes the `noLoginHandler` if the user is not authenticated. Otherwise, passes the request through.

### Handlers
#### forbid
Returns HTTP 401 status.

#### redirect(redirectUrlResolver)
- Arguments: `redirectUrlResolver: req => url`

Redirects the user to a URL, returned by the redirectUrlResolver.

