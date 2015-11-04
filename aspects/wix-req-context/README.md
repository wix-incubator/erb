# wix-req-context

Immutable object containing parameters extracted from request. Actual extraction is done by companion module  [wix-express-req-context](../wix-express-req-context).

## install

```js
npm install --save wix-req-context
```

## usage

Within request scope:

```js
const wixReqContext = require('wix-req-context');
const requestId = wixReqContext.get().requestId;
```

For complete example see [wix-express-req-context](../wix-express-req-context).

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