# wix-cluster

A node cluster wrapper with additional capabilities:
 - graceful worker shutdown, cyclic death detection, logging, etc.
 - support for communication between workers/master for scenarios like metrics, rdf...

## install

```bash
npm install --save wix-cluster
```

## usage

**Basic usage**

```js
const wixCluster = require('wix-cluster'),
    express = require('express'),
    http = require('http');

function index() {  
  const app = express();

  app.get('/', (req, res) => res.send("Hi there"));
  
  //returns a promise with `closeable` function - which cluster will invoke on shutdown.
  return new Promise(resolve => {
    const server = http.createServer(app);
    server.listen(3000, () => resolve(() => server.close()));
  })
}

wixCluster.run(index, {metrics: {app_host: 'local', app_name: 'my-app'});
```

## Api

### run(appFn, opts): Promise
Runs a node cluster executing provided `appFn` within a worker. Returns a `Promise`. 

if invoked `appFn` returns a function, cluster treats it as a function that should be invoked on:
 - worker kill event (`uncaughtException`);
 - cluster shutdown (`SIGTERM`).
 
Parameters:
 - appFn - function being executed within worker process(es). Can optionally return a `Promise`.
 - opts: object, optional:
  - metrics: mandatory properties for metrics reporting:
   - app_name: name of app,
   - app_host: host of app.
  - statsd: statsd configuration - statsd is activated only if these are provided:
   - host: statsd host,
   - interval: statsd publish interval.