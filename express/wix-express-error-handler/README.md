# wix-express-error-handler

A middleware that handles errors sourced during the processing of an express request.

On error, the handler will return HTTP status defined by the `Error` instance `httpStatusCode` property or 
500 Internal Server Error if not defined.

For AJAX request (Accept: application/json) the returned body content will be a JSON object with the following 
properties:
- `errorCode` - taken from `errorCode` property of `Error` instance (or `-100` if not defined)
- `message` - either the `Error` message (if `Error` instance has `_exposeMessage` property set to `true`) or a generic
 error message with an optional request-id taken from the [web-context aspect](../../aspects/wix-web-context-aspect).
 
P.S. To easily define your custom `Error` classes use [wix-errors](../../errors/wix-errors/README.md).

## install

```bash
npm install --save wix-express-error-handler
```

## usage

```js
const express = require('express'),
  wixExpressErrorHandler = require('wix-express-error-handler');

const app = express();

app.get('/', (req, res) => {
  throw new Error('woops'); // this will be intercepted by wixExpressErrorHandler and error page/json will be emitted.
})

// wire in the error handler
app.use(wixExpressErrorHandler());

app.listen(3000);
```
## Api

### ()
Returns middleware function which handles the errors.
