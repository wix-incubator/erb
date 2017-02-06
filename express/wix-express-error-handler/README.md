# wix-express-error-handler

A middleware that handles errors and timeouts sourced during the processing of an express request.

On error or timeout, the module will return HTTP status code 500 or 504 with a default response. Additionally, it allows the developer to customize the 500 and 504 pages.

## install

```bash
npm install --save wix-express-error-handler
```

## usage

```js
const  express = require('express'),
  wixExpressTimeout = require('wix-express-timeout'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressErrorHandler = require('wix-express-error-handler');

const app = express();

//wiring needed middlewares
app.use(wixExpressErrorCapture());
app.use(wixExpressTimeout(100));

app.get('/', (req, res) => {
  throw new Error('woops'); // this will be intercepted by wixExpressErrorHandler and error page/json will be emitted.
})

// wire in the error handler
app.use(wixExpressErrorHandler.handler());

app.listen(3000);
```
## Api

### ()
Returns middleware function which handles errors.
