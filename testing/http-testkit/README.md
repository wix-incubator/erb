## install
```javascript
    npm install http-test-kit --save
```


## test app 
```javascript
    
    // options = {port: 3333 (default)}
    var server = require('http-test-kit').testApp(options)
    
    // start
    server.listen(port);
    
    // stop
    server.close();
    
    
    // get the app for routing
    var app = server.getApp();
    app.get('/foo', function (req, res) {
        res.send(req.message);
    });

    
    
```

## you can use before and after
```javascript

    server.beforeAndAfterEach();
    or
    server.beforeAndAfter();
    

```


