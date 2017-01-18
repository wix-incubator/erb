# wix-express-error-logger

Logs express errors and passes control to next error handling middleware.

## install

```bash
npm install --save wix-express-error-logger
```

## usage

```js
const express = require('express'),
  wixExpressErrorLogger = require('wix-express-error-logger'),
  log = require('wnp-debug')('wix-express-error-logger');

const app = express()
  .get('/', (req, res, next) => next(new Error('woops')))
  .use(wixExpressErrorLogger(log)) //error logger, before actual error handler
  .use((err, req, res, next) => res.status(500).end()) // actual error handler
  .listen(3000);
```

## Api

### logger => (req, res, next)
Returns middleware function which logs errors.

Params:
  - logger - instance of `wnp-debug`.