# wix-express-monitor

A middleware module that enriches express by adding a monitoring callback for each request which included information about the request:
 - startTime
 - route
 - time to first byte
 - time to finish
 - was there a timeout?
 - any errors

This module depends on other modules to en

The module depends on other modules to enrich express with additional request lifecycle events:
 - event `x-before-flushing-headers`, module: [wix-patch-server-response](../wix-patch-server-response);
 - event `x-timeout`, module: [wix-express-timeout](../wix-express-timeout);
 - event `x-error`, module: [wix-express-error-capture](../wix-express-error-capture); 

## install

```javascript
npm install --save wix-express-monitor
```

## usage

```js

// setup the dependent modules
const express = require('express'), 
  serverResponsePatch = require('wix-patch-server-response'),
  wixExpressDomain = require('wix-express-domain'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressTimeout = require('wix-express-timeout'),
  wixExpressMonitor = require('wix-express-timeout');

const app = express();

serverResponsePatch.patch();
app.use(wixExpressDomain);
app.use(wixExpressErrorCapture.async);
app.use(wixExpressTimeout.get(10));

// setup the monitor
app.use(expressMonitor(metric => {
  // do something with the request metric
}));

// register the rest of the application
...

// complete setting up the error capture
app.use(wixExpressErrorCapture.sync);

app.listen(3000);
```

## Api

### (callback)
Registers a middleware that will call `callback` function with single parameter `metrics` which contains:
 - operationName: express `req.route.path`,
 - startTime: ISO dateTime string;
 - timeToFirstByteMs: ms, duration of request before response if is written;
 - durationMs: ms, duration of request processing;
 - timeout: true|false if request timed-out;
 - errors: Array of errors encountered if any;
 - statusCode: response status.