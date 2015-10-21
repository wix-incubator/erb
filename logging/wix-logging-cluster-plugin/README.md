# wix-logging-cluster-plugin

Takes care of writing logging events produced by adapters to proper places: log files, stdout/err, etc. 

# installation

```js
npm i --save wix-logging-cluster-plugin
```

# usage

Should be included into `wix-cluster` as follows:

```js
var wixCluster = require('wix-cluster'),
    app = require('./app');

wixCluster.builder(app)
 .withPlugin(require('wix-logging-cluster-plugin')())
 .start();
```