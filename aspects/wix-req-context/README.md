#req context
Immutable object of parameters from the request

##properties
- requestId
- localUrl
- userIp
- userPort
- userAgent
- geoData

##Usage

```javascript

 
var domain = require('wix-express-domain');
app.use(domain.wixDomainMiddleware());

var reqContext = require('wix-req-context');

// set 
reqContext.setReqContext(reqContext);

//get
var ctx = reqContext.reqContext(reqContext);

```