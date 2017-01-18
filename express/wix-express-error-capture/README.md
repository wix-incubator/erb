# wix-express-error-capture

Module to capture async errors in an express request scope.

How it works:
 - it catches async error (using node domain);
 - forwards error to express error handling flow;
 - rethrows same error on next tick (can be overriden);

This means that with default behavior your error rendering needs to be sync or you have to override `onError` hook

## install

```bash
npm install --save wix-express-error-capture
```

## usage

This module captures async errors (that would result in `uncaughtException`) and forwards to regular express error handling flow with an optional `onError` hook.

```js
const express = require('express');
  wixExpressErrorCapture = require('wix-express-error-capture');

const app = express();

//first async
app.use(wixExpressErrorCapture(err => console.log('critical error', err)));//might decide to kill process eventually, etc.

app.get('/', (req, res) => {
  process.nextTick(() => { throw new Error('async'); }); // async error that would otherwise result in `uncaughtException`;
});

// error handler will get async error
app.use((err, req, res, next) => {
  res.status(500).end();
});

app.listen(3000);
```

## Api

### (onError): (req, res, next)
Returns express middleware function to handle async errors.

Parameters:
  - onError - callback function that will receive error caught by middleware. Good place to cleanup and kill process.