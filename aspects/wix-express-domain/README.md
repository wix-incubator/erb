# wix-express-domain

Express middleware that binds [wix-domain](../wix-domain) to a a request scope for storing/retrieving request-scoped data.

## install

```js
    npm install wix-express-domain --save
```

## usage

```js
const wixDomain = require('wix-domain');

app.use(require('wix-express-domain'));

// fetch the domain (can be within IO / nextTick)
var current = wixDomain.get();

// now we can read or store data on the domain object
```

## note

This middleware must be added to app/router... before other middlewares that depend on [wix-domain](../wix-domain).