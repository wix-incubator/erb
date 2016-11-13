# wix-cluster-client

[wix-cluster](../wix-cluster)-aware client that:
 - provide unified api both when running within 'wix-cluster' and in a single-process mode.
 - provides cluster stats: cluster-wide memory stats, worker count, worker death count.
 - provides capability to broadcast messages to all workers.

## install

```bash
npm install --save wix-cluster-client
```

## usage


```js
const wixClusterClient = require('wix-cluster-client')(),
    express = require('express');

function app() {
  const app = express();

  app.get('/', (req, res) => res.send(wixClusterClient.workerCount));
  return app.listen(port);
}
```

## Api

### ()
Returns a new instance of `WixClusterClient`.

#### WixClusterClient.workerId: Int
Unique id of worker.

#### WixClusterClient.workerCount: Int
Number of worker processes. 
 
#### WixClusterClient.deathCount: Int
Number of worker death count within cluster or 'N/A' in single-process mode.

#### WixClusterClient.stats
Combined memory stats for all workers within cluster just like `process.memoryUsage()`.

#### WixClusterClient.on(eventName, listener)
Same as [EventEmitter.on](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener).

Behavior:
 - clustered - receives events sent using `WixClusterClient.emit` by itself (EventEmitter) and other worker processes; 
 - clustered - receives events sent using `WixClusterClient.emit` by this instance of `WixClusterClient`.

#### WixClusterClient.emit(eventName, data)
Same as [EventEmitter.emit](https://nodejs.org/api/events.html#events_emitter_emit_eventname_arg1_arg2).

Behavior:
 - clustered - sends events for listeners attached to all instances of `WixClusterClient` on all workers; 
 - clustered - sends events for listeners attached to same instance `WixClusterClient`.

#### WixClusterClient.configureStatsD(opts)
Sends event to cluster master to set-up StatsD publisher. Noop for non-clustered mode.

Parameters:
  - opts:
    - interval - interval in ms to publish stats;
    - host - statsd host;