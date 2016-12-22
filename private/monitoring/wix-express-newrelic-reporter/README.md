# wix-express-newrelic-reporter

Reports `x-error` and `x-timeout` events emitted on express response object (produced by [wix-express-error-capture](../wix-express-error-capture) and [wix-express-timeout](../wix-express-timeout)) middlewares to new relic.

It supports multiple modes of execution:
 - stub new relic instance - disabled;
 - properly configured new relic instance - enabled.

## install

```bash
npm install --save wix-express-newrelic-reporter
```

## usage

```js
const express = require('express'),
  log = require('wnp-debug')('newrelic-reporter'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressTimeout = require('wix-express-timeout'),
  newrelic = require('newrelic'),
  newRelicReporter = require('wix-express-newrelic-reporter');

const app = express();

app.use(wixExpressErrorCapture.async);
app.use(wixExpressTimeout.get(1000));
app.use(newRelicReporter(newrelic, log));

app.get('/', () => {
  throw new Error('woops');//will be reported to new relic within transaction.
});

app.use(wixExpressErrorCapture.sync);

app.listen(3000);
```

## Api

### (newrelic, log) => (req, res, next)
Returns middleware function which reports errors via provided newrelic instance.

Parameters:
 - newrelic - preconfigured instance of [newrelic](https://www.npmjs.com/package/newrelic);
 - log - instance of [wnp-debug](../../../logging/wnp-debug);