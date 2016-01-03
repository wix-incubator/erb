# wix-express-error-capture

Module to capture errors on an express request scope. The module handles two different kind of errors - Sync and Async.

When an error happens, the module emits a ```x-error``` event on the response object with the error itself as a payload of the error event, allowing listening parties to handle the error.

## install

```js
npm install --save wix-express-error-capture
```

## usage

This module relies on wix-domain and introduces two middleware that have to be registered in the right order:
 - async - has to be registered right after wix-domain;
 - sync - has to be registered last in the handler chain (including routes).

```js
const express = require('express');
  wixExpressDomain = require('wix-express-domain'),
  wixExpressErrorCapture = require('wix-express-error-capture');

const app = express();

//wiring needed middlewares
app.use(wixExpressDomain);
app.use(wixExpressErrorCapture.async);

//now wire in your custom middleware
app.use((req, res, next) => next());

//wire-in error logging middleware - could be something else
app.use((req, res, next) => {
  res.on('x-error', function(error) {
    console.log(error);
  });
  next();
});

app.get('/', (req, res) => {
  res.end('hello');
});

//wire-in sync error capture as last after all of the other routes or middlewares
app.use(wixExpressErrorCapture.async);

app.listen(3000);
```

Error middleware could terminate response sooner if that is what you wish:

```js
app.use((req, res, next) => {
  res.on('x-error', err => {
    res.status('500').send('we had an error - ' + err.message);
  });
  next();
});
```

## Api

### async
Returns middleware function that registers an emitter to handle async errors.

### sync
Returns middleware function that registers an emitter to handle sync errors.
