# wix-management-app

A management app (app-info) to be run via wix-cluster. Provides basic endpoints required as a contract with ops and is extensible via plugins.

It is plugged-in with default pages into wix-cluster, but can be overridden/extended.

## install

```js
npm install --save wix-management-app
```

## usage

```js
const express = require('express'); 
  ManagementAppBuilder = require('wix-management-app');

function plugin() {
    var app = express.Router();
    app.get('/', (req, res) => {
        res.send('Hi there.');
    });
}

const app = ManagementAppBuilder()
    .addRouter(plugin())
    .addRouters([plugin1, plugin2])
    .build();
```

## Api

### ()
Returns a management app builder instance.

### ManagementAppBuilder.addRouter(express)
Allows to add additional pages to a management app.

Parameters:
 - express - an express router that can be plugged-in to an express app.
 
### ManagementAppBuilder.addRouters(express)
Allows to add additional pages to a management app.

Parameters:
 - express[] - an array of express routers that can be plugged-in to an express app.

### ManagementAppBuilder.build()
Returns an `express` app that can be plugged-in to [wix-cluster](../wix-cluster). 