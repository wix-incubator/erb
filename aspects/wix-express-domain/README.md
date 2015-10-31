# wix-express-domain

Express middleware that binds [wix-domain](../wix-domain) to a a request scope for storing/retrieving request-scoped data.

## install

```js
    npm install wix-express-domain --save
```

## usage

```js
const express = require('express'),
  wixExpressDomain = require('wix-express-domain'),
  wixDomain = require('wix-domain'),;

const app = express();
app.use(wixExpressDomain);

app.get('/', (req, res) => {
  // fetch the domain (can be within IO / nextTick)
  var current = wixDomain.get();
});
```

## Api

### ()

Returns http://expressjs.com/ middleware function.

## note

This middleware must be added to app/router... before other middlewares that depend on [wix-domain](../wix-domain).