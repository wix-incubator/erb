# wix-req-context

Immutable object containing parameters extracted from request. Actual extraction is done by companion module per web framework, ex. for http://expressjs.com/ - [wix-express-req-context](../wix-express-req-context).

## install

```js
npm install --save wix-req-context
```

## usage

```js
const express = require('express'),
  wixExpressReqContext = require('wix-express-req-context'),
  wixReqContext = require('wix-req-context');

const app = express();
app.use(wixExpressReqContext);

app.get('/', (req, res) => {
    res.send(wixReqContext.get().requestId);
});

...
```

## Api

### set(reqContext)

Sets request context, can be done only once during lifecycle of request.

### get()

Returns an object that represents stored request context.

Available entries:
 - requestId;
 - userAgent;
 - url;
 - localUrl;
 - ip;