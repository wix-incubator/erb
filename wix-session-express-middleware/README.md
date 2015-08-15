# Wix session express middleware

## install
```
    npm install wix-session-express-middleware --save
```

## usage
```javascript 
   //wix domain is a must first
    app.use(require('wix-node-domain')..wixDomainMiddleware());  
    var wixSessionMiddleware = require('wix-session-express-middleware')({mainKey: '1234567890123456', alternateKey: '6543210987654321'});
    app.use(wixSessionMiddleware.middleware())                 
    
```

## from the controller
```javascript
    // if you have session and you entered the controller
    // you can get the wixSession 
    app.get('/requireLogin', function(req, res) {
        res.send(wixSessionMiddleware.session().userGuid);
    });
```




