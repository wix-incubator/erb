# wix-express-bo-auth
This module provides express middleware to handle authorisation with BO.
[Wix BO Auth](https://github.com/wix-private/wix-bo-auth)

## install

```bash
npm install --save wix-express-bo-auth
```

## usage

```js
const boAuth = require('wix-express-bo-auth');

const boUrl = 'https://bo.wix.com';
const redirectUrlBuilder = req => 'http://localhost/redirect-on-unauthenticated';
const boEncryptionKey = 'xx';

const { authenticate, redirect } = boAuth({ wixBoUrl, redirectUrlBuilder, boEncryptionKey });

app.get('/redirect-on-unauthenticated', redirect, (req, res) => {
  res.sendStatus(200);
});

app.get('/get-error-on-unauthenticated', authenticate, (req, res) => {
  res.sendStatus(200);
});
```

## API

## ({ wixBoUrl, redirectUrlBuilder, boEncryptionKey, updateRequest }): {redirect, authenticate}
Returns object with middlewares for both redirecting to bo and authenticating api requests against bo.

Parameters:
 - wixBoUrl, mandatory: url to BO service that will perform authentication `https://bo.wix.com/bo-auth`;
 - redirectUrlBuilder(req), mandatory: builds link back to the page you want to go after authentication is completed, ex. `req => 'http://myapp.com/login'`
 - boEncryptionKey, mandatory: encryption key/password that is used by the BO service to encrypt cookie value;
 - updateRequest(req, boAuthData), optional: custom function to set boAuth data on request object, defaults to setting it to `req.wix.boAuth`.

Returned middlewares:
 - redirect: checks if user is logged in with BO, redirects to the BO service for authentication otherwise.
 - authenticate: checks if user is logged in with BO, returns Unauthorized (wix)error otherwise;   
