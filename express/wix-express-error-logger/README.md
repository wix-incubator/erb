# wix-express-error-logger

Logs `x-error` and `x-timeout` events emitted on express response object (produced by [wix-express-error-capture](../wix-express-error-capture) and [wix-express-timeout](../wix-express-timeout)) middlewares using debug module and `wnp:express-error-logger` key.

## install

```js
npm install --save wix-express-error-logger
```

## usage

```js
const express = require('express'),
  serverResponsePatch = require('wix-patch-server-response'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressTimeout = require('wix-express-timeout'),
  wixExpressErrorLogger = require('wix-express-error-logger');

const app = express();

serverResponsePatch.patch();
app.use(wixExpressErrorCapture.async);
app.use(wixExpressTimeout.get(1000));
app.use(wixExpressErrorLogger);

app.get('/', () => {
  throw new Error('woops');//will be logged.
});

app.use(wixExpressErrorCapture.sync);

app.listen(3000);
```

## Api

### (req, res, next)
Returns middleware function which logs errors