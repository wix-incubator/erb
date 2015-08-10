# wix-node-domain
This module is the base middlware that creates wix domain on the event loop.


## install
```javascript
    npm install wix-node-domain --save
```

## usage
```javascript

var domainHelper = require('wix-node-domain');

// use middleware
app.use(domainHelper.wixDomainMiddleware());

// fetch the domain (can be after IO / nextTick)
var domain = domainHelper.wixDomain();

```

