# Wix session express middleware

## install
```
    npm install wix-session-express-middleware --save
```

## usage
```
    var wixSessionMiddleware = require('wix-session-express-middleware');    
    wixSessionMiddleware.init(app, '/requireLogin', {mainKey: builders.key()});                 

    /**
     * Init parameters
     * @param app  - express app
     * @param routes - routes pattern for match the controller that will require wixSession
     * @param keys - object mainKey, alternateKey
     */
```

## from the controller
```
    // if you have session and you entered the controller
    // you can get the wixSession
    app.get('/requireLogin', function(req, res) {
        res.send(req.wixSession.userGuid);
    });
```




