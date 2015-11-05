# wix-express-timeout

Adds a middleware that tracks a request and sets a timeout for the request. If the request does not complete within the specified timeout
 the middleware will emit a ```x-timeout``` event on the response allowing other middleware to handle the timeout.

The module does not close the response nor does it write anything to the response. It is the responsibility of the user of this module
to register an event listener and handle timeouts.

## install

```js
npm install --save wix-express-timeout
```

## usage

```js
const express = require('express'),
  wixExpressTimeout = require('wix-express-timeout');

const app = express();

// setup a 10 milli-seconds timeout on all routes
app.use(wixExpressTimeout(10));

// 10ms timeout applies
app.get('/', (req, res) => res.end('hi'));

// override the timeout to be 100 milli-seconds for the /slower/* route.
app.use('/slower/*', wixExpressTimeout(100));

// 100ms timeout applies
app.get('/slower', (req, res) => res.end('hi'));

// [optional - per module usage] setup a middleware to listen on the timeout and send a response
app.use((req, res, next) => {
  res.on('x-timeout', () => res.status(503).send('timeout'));
  next();
});

app.listen(3000);
```
## Api

### (timeoutMs)
Returns middleware function which, upon plugging in to express will emit `x-timeout` event if request takes longer than `timeoutMs`.

Parameters:
 - timeoutMs - miliseconds after which `x-timeout` event will be emitted on response.