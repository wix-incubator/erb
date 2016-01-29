# wix-cluster

A node cluster wrapper with additional capabilities:
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

wixCluster({app: app}).start();
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

wixCluster({
  app: app,
  plugins: [new CustomPlugin()])
}.start();
  
```

**With management app**

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

wixCluster({
  app: app,
  managementApp: managementApp({...}))
  }).start();
```

## Api

### (opts)
Returns a `WixCluster`.
 
Parameters:
 - opts: object, mandatory with entries:
  - app: mandatory, function, that upon invoking will start an app (http server);
  - managementApp: optional, object/instance with function 'start()' that will start management app;
  - workerCount: optional, number of worker processes to start, defaults to 2;
  - plugins: list of plugin instances.
 
### WixCluster.start()
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

## Events

Wix cluster emits events events on [wix-cluster-exchange](../wix-cluster-exchange) topics

### 'cluster-stats'
Events about cluster:
 - {type: 'forked', id: worker.id} - cluster worker forks;
 - {type: 'disconnected', id: worker.id} - cluster worker disconnects;
 - {type: 'stats', id: $id, pid: $pid, stats: $stats} - events with cluster process memory stats;
    - id - id of process - either 'master' or worker process id;
    - pid - parent process id;
    - status = process.memUsage().