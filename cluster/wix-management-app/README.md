# wix-management-app

A management app (app-info) to be run via wix-cluster. Provides basic endpoints need to for a contract with ops and is extensible via plugins.

```js
var express = require('express'); 
    ManagementAppBuilder = require('wix-management-app');

function plugin() {
    var app = express.Router();
    app.get('/', function(req, res) {
        res.send('Hi there.');
    });
}

var app = ManagementAppBuilder()
    .addPage(plugin())
    .build();
```

It is plugged-in with default pages into wix-cluster, but can be overridden/extended.