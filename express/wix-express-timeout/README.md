# wix-express-timeout

Adds a middleware that tracks a request and sets a timeout for the request. If the request does not complete within the specified timeout
 the middleware will emit a ```x-timeout``` event on the response allowing other middleware to handle the timeout.

The module does not close the response nor does it write anything to the response. It is the responsibility of the user of this module
to register an event listener and handle timeouts.

## install
```javascript
    npm install wix-express-timeout --save
```

## usage
```javascript

var expressTimeout = require('wix-express-timeout');

// setup a 10 milli-seconds timeout on all routes
testApp.use(expressTimeout.middleware(10));

// override the timeout to be 100 milli-seconds for the /slower/* route.
testApp.use('/slower/*', expressTimeout.middleware(100));

// [optional - per module usage] setup a middleware to listen on the timeout and send a response
testApp.use(function(req, res, next) {
  res.on('x-timeout', function() {
    res.status(503).send('timeout');
  });
  next();
});

```
