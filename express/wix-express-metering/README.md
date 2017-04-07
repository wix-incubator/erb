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

Given an instance of [WixMeasuredFactory](../../private/monitoring/wix-measured/lib/wix-measured-factory.js)
two middleware functions returned:
- `routesMetering` - __must be registered as a first middleware - before any other middlewares added and before routes definition!__
Handles `request` instrumentation and registers `response.finish` hook to handle the actual reporting.

- `errorsMetering` - __must be registered as last middleware!__. Captures thrown errors and stores relevant metadata for later reporting. 

```js
const express = require('express'),
    metering = require('wix-express-metering').factory,
    withCustomTag = require('wix-express-metering').tagging;
    
const wixMeasuredFactory = // initialized instance of WixMeasuredFactory
const {routesMetering, errorsMetering} = metering(wixMeasuredFactory);

const app = express();

app.use(routesMetering);

app.get('/my-route', (req, res) => res.send('bohoo').end());
app.post('/my-other-route', (req, res) => res.send('bohoo').end());
app.post('/yet-another-route', withCustomTag('INFRA'), (req, res) => res.send('bohoo').end());

app.use(errorsMetering);

app.listen(3000);

```

## Api
###factory(WixMeasuredFactory) => {routesMetering, errorsMetering}
Function that accepts instance of `WixMeasuredMetering` and returns an object with two middlewares.

###routesMetering: (req, res, next)
express.js middleware - must be registered as a first middleware.
Handles `request` instrumentation and registers `response.finish` hook to handle the actual reporting.

###errorsMetering: (err, req, res, next)
express.js middleware - must be registered as a first middleware.
Captures thrown errors and stores relevant metadata for later reporting.

###tagging(tag) => [express middleware]
Given a tag (string) returns a middleware that tags requests with the tag - used later by `routesMetering` and `errorsMetering`
middlewares to report its metrics with the provided tag.
When not used, the default tag is `WEB`.