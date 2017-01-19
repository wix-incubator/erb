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

wixCluster.run(index);
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
  - metrics: tags for metrics reporting;
 
## Event broadcasting

Wix cluster supports event broadcasting - worker can send an event that will be broadcasted to all workers (including self):
```js
process.send({
  origin: 'wix-cluster',
  key: 'broadcast',
  value: 'msg I want to broadcast'
});
```
 
wix-cluster intercepts events with origin set to 'wix-cluster' and key 'broadcast' and retransmits enclosed 'value', so workers can listen for broadcast events:
```js
process.on('message', evt => {
  if (evt && evt.origin && evt.origin === 'wix-cluster' && evt.key === 'broadcast') {
    console.log('Received broadcast event from wix-cluster', evt.value);  
  }
});
```

or recommended way is to use [wix-cluster-client](../wix-cluster-client).
 
## Events

Wix cluster emits events to workers, where event is a json object that can be identified with key 'origin' and value 'wix-cluster'.

Event properties:
 - origin: 'wix-cluster'
 - key: mandatory, event id,
 - value: event payload - can be number, string, object.

You can listen on events within your app like:

```js
process.on('message', evt => {
  if (evt && evt.origin && evt.origin === 'wix-cluster') {
    console.log('Received event from wix-cluster', evt);  
  }
});
```

or recommended way is to use [wix-cluster-client](../wix-cluster-client).

### key: 'worker-count'
Active worker count. Emitted for a worker that started listening or broadcasted when some worker dies/disconnects;

```js
{
  origin: 'wix-cluster',
  key: 'worker-count',
  value: 2
}
```

### key: 'death-count'
Number of worker deaths from when application was started. Emitted for a worker that started listening and broadcasted to existing workers when one of the workers dies/disconnects.

```js
{
  origin: 'wix-cluster',
  key: 'death-count',
  value: 2
}
```

### key: 'broadcast'
Broadcast events that were received from worker processes 

```js
{
  origin: 'wix-cluster',
  key: 'broadcast',
  value: 2
}
```

## StatsD

WixCluster can emit master process stats to a statsd. It is activated by worker process by emitting a message:

```js
process.send({
  origin: 'wix-cluster',
  key: 'statsd',
  value: {
      host: 'localhost',
      interval: 30000
  }
});
```

