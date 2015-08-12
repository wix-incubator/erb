## install
```javascript
    npm install http-test-kit --save
```


## test app - don't use it yet, i am not satisfied from this
```javascript
    
    var server = require('http-test-kit').testApp();
    
    // start
    server.listen(port);
    
    // stop
    server.close();
    
    // add list of middlewars
    server.middlewares([middleware()])
    
    // get the app for routing
    var app = server.app();
    app.get('/foo', function (req, res) {
        res.send(req.message);
    });

    
```


