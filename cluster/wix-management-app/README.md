# wix-management-app

A management app that provides you 2 basic things:
 - provides status check endpoints that are required by wix ops for deployment/running an app.
 - allows you to embed 'app-info' to serve as a basic dashboard of your app.

## install

```js
npm install --save wix-management-app
```

## usage

```js
'use strict';
const cluster = require('cluster'),
  express = require('express'),
  managementApp = require('wix-management-app');

if (cluster.isMaster) {
  managementApp({
    appPort: process.env.PORT,
    managementPort: process.env.MANAGEMENT_PORT,
    mountPoint: process.env.MOUNT_POINT
  }).start();

  cluster.fork();
} else {
  express()
    .get((process.env.MOUNT_POINT || '') + '/health/is_alive', (req, res) => res.send('Alive'))
    .listen(process.env.PORT);
}
```

## Api

### (opts)
Returns a 'ManagementApp' instance.

Parameters:
 - opts, object, mandatory with entries:
  - appPort: int, mandatory - a port on which your actual app is running. It will check if it's alive via `http://localhost:${appPort}${mountPoint}/health/is_alive`;
  - managementPort: int, mandatory - a port to run management app;
  - mountPoint: string, optional - where to mount served resources/views/apps;
  - appInfo: function, optional - function that returns express router, app, handler which will be mounted on '/app-info'.

### ManagementApp.start(done)
Starts a management app.

Parameters:
 - dome - optional callback that will be invoked once app is started.