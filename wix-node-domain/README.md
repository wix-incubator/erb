# wix-node-domain
This module is the base middlware that creates wix domain on the event loop. The wix domain can be used to store request bound data or listen on errors.

The domain emits an ```x-error``` event on the response object with the error as a payload in case or request bound errors (only async errors - see below).



## install
```javascript
    npm install wix-node-domain --save
```

## usage
```javascript

var wixDomain = require('wix-node-domain');

// use middleware
app.use(wixDomain.wixDomainMiddleware());

// fetch the domain (can be after IO / nextTick)
var domain = wixDomain.wixDomain();

// now we can read or store data on the domain object
```

### Async Errors

To listen on errors (async only) that accrue on the request we use

```javascript
app.use(function(req, res, next) {
  res.on('x-error', function(error) {
    // do something with the error
  });
  next();
});
```

### Sync Errors

Note that due to the way express handles sync errors - using a last middleware with 4 parameters we are required
to also register this last middleware that emits the x-error event

```
app.use(wixDomain.expressErrorHandlerMiddleware);
```

or explicitly -


```
app.use(function(err, req, res, next) {
  res.emit('x-error', err);
});
```



