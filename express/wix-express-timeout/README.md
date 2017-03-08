# wix-express-timeout

Adds a middleware that tracks a request and sets a timeout for the request. If the request does not complete within the specified timeout
 the middleware will move to express error handling path.

The module does not close the response nor does it write anything to the response. It is the responsibility of the user of this module
to register an event listener and handle timeouts.

Emitted error has property `_timeout` = true set.

## install

```bash
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


app.use((err, req, res, next) => {
  if (err._timeout && err._timeout === true) {
    res.status(504).send(error.message);
  } else {
    //other errors
  }
});

app.listen(3000);
```
## Api

### (timeoutMs)
Returns middleware function which, upon plugging in to express will trigger error handling flow if request takes longer than `timeoutMs`.

Parameters:
 - timeoutMs - milliseconds after which error will be emitted.
