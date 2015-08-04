# Wix session express middleware

## install
```
    npm install wix-session-express-middleware --save
```

## usage
```
    var wixSession = require('wix-session')({mainKey: builders.key()});
    
    var app = express();
    var wixSessionMiddleware = require('../index')(app, wixSession);
    
    // this tells express to check for session and return 401 if not 
    // exists in path /requireLogin
    app.use('/requireLogin', wixSessionMiddleware.process());
        

```

## from the controller
```
    // if you have session and you entered the controller
    // you can get the wixSession
    app.get('/requireLogin', function(req, res) {
        res.send(req.wixSession.userGuid);
    });
```




