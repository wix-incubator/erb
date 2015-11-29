# wix-metrics-cluster-plugin

A set of cluster plugins and express middleware that implements the reporting of operation metrics, aggregation and publishing.

At the moment the module just exposes a `/stats` management application urls that returns a json of all the metrics.

The module includes:

* wixExpressMonitorCallback - a callback function to be used with [wix-express-monitor.get](../../express/wix-express-monitor).
* clusterPlugin - a cluster plugin that installs the metrics aggregation on the master process
* managementPlugin - a plugin to the master management application to expose the `/stats` endpoint.

## install

```javascript
npm install --save wix-metrics-cluster-plugin
```

## usage

Installing the cluster plugins

```js
const   wixMetricsPlugin = require('wix-metrics-cluster-plugin').clusterPlugin(),
        wixManagementStats = require('wix-metrics-cluster-plugin').managementPlugin();

wixClusterBuilder(app)
  .addPlugin(wixMetricsPlugin)
  .withManagementRouter(wixManagementStats)
  .withWorkerCount(1)
  .start();
```

installing the handler for express monitor

```js

  // ... other express setup code
  wixExpressMonitor = require('wix-express-monitor'),
  wixExpressMonitorCallback = require('wix-metrics-cluster-plugin').wixExpressMonitorCallback;

  app.use(wixExpressMonitor.get(wixExpressMonitorCallback));

```

## Api

### clusterPlugin
Function that returns an instance of the cluster plugin

### managementPlugin
Function that returns an instance of the management app plugin

### wixExpressMonitorCallback
Callback function to be used with [wix-express-monitor.get](../../express/wix-express-monitor).
The function expects to receive operation metrics object of the format
```js
{
  operationName: [String],
  startTime: [ISO Date formatted string],
  timeToFirstByteMs: [Number],
  durationMs: [Number],
  timeout: [Boolean],
  errors: [Array<Error>]
}
```


