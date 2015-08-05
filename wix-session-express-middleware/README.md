# Wix session express middleware

## install
```
    npm install wix-session-express-middleware --save
```

## usage
```
    var wixSessionMiddleware = require('wix-session-express-middleware');    
    wixSessionMiddleware.init(app, '/requireLogin', {mainKey: builders.key()});                 

```

## from the controller
```
    // if you have session and you entered the controller
    // you can get the wixSession
    app.get('/requireLogin', function(req, res) {
        res.send(req.wixSession.userGuid);
    });
```




