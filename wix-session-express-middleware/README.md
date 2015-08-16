# Wix session express middleware

## install
```
    npm install wix-session-express-middleware --save
```

## usage

Details of the structure of the Wix Session cookie are at the [wix-session](../wix-session) module

```javascript
    // import wix domains
    app.use(require('wix-node-domain').wixDomainMiddleware());

    // import wix session
    var wixSession = require('wix-session')({mainKey: ...});

    // instantiate the service
    var requireLoginService = require('wix-session-express-middleware')(wixSession);

    // setup route to require login
    app.use('/requireLogin', requireLoginService.requireLogin());

    // setup route to require login with a custom callback
    app.use('/requireLoginCallback', requireLoginService.requireLoginWithCallback(invalidSessionHandler));

    // setup route to not require login but still parse and keep the session object
    app.use('/', requireLoginService.trackSession());

```

## getting the session from any express handler
```javascript
    // if you have session and you entered the controller
    // you can get the wixSession 
    app.get('/requireLogin', function(req, res) {
        res.send(requireLoginService.wixSession().userGuid);
    });
```




