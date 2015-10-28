# Wix session express middleware

## install
```
    npm install wix-express-session --save
```

## usage

Details of the structure of the Wix Session cookie are at the [wix-session](../wix-session) module

```javascript
    // import wix domains
    app.use(require('wix-express-domain').wixDomainMiddleware());

    // import wix session
    var wixSession = require('wix-session')({mainKey: ...});

    // instantiate the service
    var requireLoginService = require('wix-express-session')(wixSession);

    // setup route to require login
    app.use('/requireLogin', requireLoginService.requireLogin());

    // setup route to require login with a custom callback
    app.use('/requireLoginCallback', requireLoginService.requireLoginWithCallback(invalidSessionHandler));

    // setup route to require login with a redirect
    app.use('/requireLoginRedirect', requireLoginService.requireLoginWithRedirect());

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


//TODO:
redirect logic is missing -
* correct domain (need to take it from config)
* locale redirect (need locale support)
* Scala's com.wixpress.framework.security.RedirectBackURLGenerator#generateRedirectBackUrl