# wix-patch-server-response

This module patches the `_http_server` node module adding to the http server response object the capability
to emit the `x-before-flushing-headers` event just before the HTTP headers are written.

This can be used to:
 - track the time to first byte of a request;
 - add or modify headers to the response.

**Note:** this module works for any HTTP server based on node, not limited to Express.

## install

```js
npm install --save wix-patch-server-response
```

## usage

```js
const express = require('express'); 
  wixPatchServerResponse = require('wix-patch-server-response');

// activate
patchServerResponse.patch();

const app = express();

// [optional] listening on the event via Express middleware
app.use((req, res, next) => {
  res.on("x-before-flushing-headers", () => {
    // do something
  });
  next();
});

// deactivate
patchServerResponse.unpatch();
```

## Api

### patch()
Patches the `_http_server` to emit `x-before-flushing-headers` event on response object.

### unpatch()
Reverts `_http_server` to emitting original `before-flushing-headers` event.
