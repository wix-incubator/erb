# wix-express-error-capture
Module to capture errors on an express request scope. The module handles two different kind of errors - Sync and Async.
 When an error happens, the module emits a ```x-error``` event on the response object with the error itself as a payload
 of the error event, allowing listening parties to handle
 the error.

### Async Errors

To listen for errors in async flows, register the ```asyncErrorMiddleware``` right after the ```wix-domain``` middlware

```javascript
var wixDomain = require('wix-domain');
var wixExpressErrorCapture = require('wix-express-error-capture');

app.use(wixDomain.wixDomainMiddleware());
app.use(wixExpressErrorCapture.asyncErrorMiddleware);
```

### Sync Errors

Express handles sync errors using a middleware that has to be last and accept 4 parameters.
You should register the ```syncErrorMiddleware``` as a last middleware after all of the other routes or middlewares.


```javascript
var wixExpressErrorCapture = require('wix-express-error-capture');

app.use(wixExpressErrorCapture.syncErrorMiddleware);
```

### Listening on errors

To listen on errors simply register an event handler for the ```x-error` event on the response object.

```javascript
app.use(function(req, res, next) {
  res.on('x-error', function(error) {
    // do something with the error
  });
  next();
});
```
