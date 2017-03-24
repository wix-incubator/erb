# wix-express-metering

This module facilitates [wix-measured-metering](../../private/monitoring/wix-measured-metering/README.md) to add 
metering to express.js routes. The following metrics reported:
- count of successful calls - no error thrown and HTTP status code is in range [100-400)
- histogram of route execution time in millis for successful calls
- count of failed calls (either due to error thrown or HTTP status code not in success range)

## install

```bash
npm install --save wix-express-metering
```

## usage

Given a configured instance of [WixMeasuredMetering](../../private/monitoring/wix-measured-metering/lib/wix-measured-metering.js)
two middleware functions returned:
- `routesMetering` - __must be registered as a first middleware - before any other middlewares added and before routes definition!__
Handles `request` instrumentation and registers `response.finish` hook to handle the actual reporting.

- `errorsMetering` - __must be registered as last middleware!__. Captures thrown errors and stores relevant metadata for later reporting. 

```js
const express = require('express');
    metering = require('wix-express-metering');
    
const measured = // initialized instance of WixMeasuredMetering
const {routesMetering, errorsMetering} = metering(measured);

const app = express();

app.use(routesMetering);

app.get('/my-route', (req, res) => res.send('bohoo').end());
app.post('/my-other-route', (req, res) => res.send('bohoo').end());

app.use(errorsMetering);

app.listen(3000);

```

## Api
###WixMeasuredMetering => {routesMetering, errorsMetering}
Function that accepts instance of `WixMeasuredMetering` and returns an object with two middlewares.

###routesMetering: (req, res, next)
express.js middleware - must be registered as a first middleware.
Handles `request` instrumentation and registers `response.finish` hook to handle the actual reporting.

###errorsMetering: (err, req, res, next)
express.js middleware - must be registered as a first middleware.
Captures thrown errors and stores relevant metadata for later reporting.
