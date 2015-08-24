# patch-server-response
This module patches the ```_http_server``` node module adding to the http server response object the capability
to emit the ```x-before-flushing-headers``` event just before the HTTP headers are written.

This can be used to

* track the time to first byte of a request
* add or modify headers to the response

Note this module works for any HTTP server based on node, not limited to Express

## install
```javascript
    npm install patch-server-response --save
```

## usage
```javascript

var patchServerResponse = require('patch-server-response');

// activate
patchServerResponse.patch();

// [optional] listening on the event via Express middleware
app.use(function (req, res, next) {
  res.on("x-before-flushing-headers", function() {
    // do something
  });
  next();
});

// deactivate
patchServerResponse.unpatch();

```

