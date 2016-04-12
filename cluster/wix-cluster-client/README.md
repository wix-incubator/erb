# wix-cluster-client

[wix-cluster](../wix-cluster)-aware client that:
 - provide unfified api both when running within 'wix-cluster' and in a single-process mode.
 - provides cluster stats: cluster-wide memory stats, worker count, worker death count.

## install

```js
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

#### WixClusterClient.workerCount
Number of worker processes. 
 
#### WixClusterClient.deathCount
Number of worker death count within cluster or 'N/A' in single-process mode.

#### WixClusterClient.stats
Combined memory stats for all workers within cluster just like `process.memoryUsage()`.
