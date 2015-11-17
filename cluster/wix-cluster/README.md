# wix-cluster

A node cluster wrapper with additional capabilities:
 - management-app provided out of the box (extensible);
 - graceful worker shutdown, cyclic death detection, logging, etc.
 - support for communication between workers/master for scenarios like metrics, rdf...

## install

```js
npm install --save wix-cluster
```

## usage

**Basic usage**

```js
const wixCluster = require('wix-cluster'),
    express = require('express');

function app() {
  const app = express();

  app.get('/', (req, res) => res.send("Hi there"));

  wixCluster.workerShutdown.addResourceToClose(app);
  return app.listen(port);
}

wixCluster.builder(app).start();
```

**With custom plugin**

```js
const wixCluster = require('wix-cluster'),
  express = require('express');

function app() {
  const app = express();

  app.get('/', (req, res) => res.send("Hi there"));

  wixCluster.workerShutdown.addResourceToClose(app);
  return app.listen(port);
}

function CustomPlugin() {
  this.onMaster = (cluster, next) => {
    cluster.on('fork', () => console.log("Custom plugin just noticed a fork"));
    next();
  }
}

wixCluster.builder(app)
  .withPlugin(new CustomPlugin())
  .start();
```

**With management app plugin**

```
const wixCluster = require('wix-cluster'),
    managementApp = require('wix-management-app'),
    express = require('express');

function app() {
  const app = express();

  app.get('/', (req, res) => res.send("Hi there"));

  wixCluster.workerShutdown.addResourceToClose(app);
  return app.listen(port);
}

function managementAppPlugin() {
  const app = express.Router();

  app.get('/custom', (req, res) => res.send('Custom'));

  return app;
}

wixCluster.builder(app)
  .withManagementApp(managementApp.builder()
    .addPage(managementAppPlugin())
    .build())
  .start();

  // or

wixCluster.builder(app)
  .withManagementRouter(managementAppPlugin())
  .start();

```

## Api

### builder(app)
Returns a `WixClusterBuilder`.
 
### WixClusterBuilder(app)
Builder to build and start `WixCluster`.

Parameters:
 - app - client function that will run on forked processes. Usually an express app.

### WixClusterBuilder.withWorkerCount(count)
Override default child process count.

### WixClusterBuilder.withManagementApp()
Replace default [wix-management-app](../wix-management-app) with custom one, or otherwise customized one.

### WixClusterBuilder.withManagementRouter()
Extends default [wix-management-app](../wix-management-app), adding an express router to it.

### WixClusterBuilder.addPlugin(plugin)
Add a custom plugin. For plugin examples see [default plugins](lib/plugins).

### WixClusterBuilder.withoutDefaultPlugins()
Remove default [default plugins](lib/plugins).

### WixClusterBuilder.start()
Starts node cluster with `app` function spawned as separate processes.

### workerShutdown.addResourceToClose(resource)
Adds a resource to be closed as a worker is shutdown. The resource is expected to have a ```close()``` method. Normally this will be an instance of Express or server port.
Forgetting to add the resource to the shutdown list will not prevent the worker process from exiting, but will delay it until the ```forceExitTimeout``` timeout.

### workerShutdown.forceExitTimeout
Time to allow a worker process to terminate gracefully before killing it. Defaults to 5 seconds.

### workerShutdown.shutdown
Tries to gracefully close the worker application. The method will

1. try to close all resources registered with ```addResourceToClose```
2. try to disconnect the worker from the cluster master
3. register a timeout to force close the application if it does not end gracefully
4. in case of any error exits the application



## TBD
 - [plugin] smarter way to detect stalled workers - ex. if cpu for process is above some % for some time, kill it;
 - [cluster/plugins] logger for cluster and plugins, should drop console.log;
 - [cluster/plugins] rdf poc - data is loaded on start-up, and loaded on workers before app is started + data refresh from cluster to workers;