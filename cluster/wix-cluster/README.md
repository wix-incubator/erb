# wix-cluster

A node cluster wrapper with additional capabilities:
 - management-app provided out of the box (extensible);
 - graceful worker shutdown, cyclic death detection, logging, etc.
 - support for communication between workers/master for scenarios like metrics, rdf...

# Usage

```js
$ npm install --save wix-cluster
```

**Basic usage**

```js
var wixCluster = require('wix-cluster'),
    express = require('express');

function app() {
  var app = express();

  app.get('/', function(req, res) {
    res.send("Hi there");
  });

  return app.listen(port);
}

wixCluster.builder(app).start();
```

**With custom plugin**

```js
var wixCluster = require('wix-cluster'),
  express = require('express');

function app() {
  var app = express();

  app.get('/', function(req, res) {
    res.send("Hi there");
  });

  return app.listen(port);
}

function CustomPlugin() {
  this.onMaster = function(cluster, next) {
    cluster.on('fork', function() {
      console.log("Custom plugin just noticed a fork");
    });

    next();
  }
}

wixCluster.builder(app)
  .withPlugin(new CustomPlugin())
  .start();
```

**With management app plugin*

```
var wixCluster = require('wix-cluster'),
    managementApp = require('wix-management-app'),
    express = require('express');

function app() {
  var app = express();

  app.get('/', function(req, res) {
    res.send("Hi there");
  });

  return app.listen(port);
}

function managementAppPlugin() {
  var app = express.Router();

  app.get('/custom', function(req, res) {
    res.send('Custom');
  });

  return app;
}

wixCluster.builder(app)
  .withManagementApp(managementApp.builder()
    .addPage(managementAppPlugin())
    .build())
  .start();
```

## DONE
 - [cluster] plugin support;
 - [cluster] debug support - if node is running in debug mode (--debug, --debug-brk), app is run in single-process mode, otherwise in normal set-up;
 - [cluster] spawning of multiple workers - defaults to 2, configurable;
 - [plugin] cluster lifecycle debug;
 - [plugin] graceful shutdown of workers - does not accept new connections, allows for worker to complete whatever it is doing;
 - [plugin] respawning of dying workers, cyclic death detection - configurable;
 - [cluster] a way to communicate between cluster/workers;
 - [cluster] management app with basic info, receiving info via messages/events from cluster plugin;
 - [cluster] better way of building WixCluster;

## TBD
 - [plugin] smarter way to detect stalled workers - ex. if cpu for process is above some % for some time, kill it;
 - [cluster/plugins] logger for cluster and plugins, should drop console.log;
 - [cluster/plugins] rdf poc - data is loaded on start-up, and loaded on workers before app is started + data refresh from cluster to workers;

## TBD

### soft worker shutdown restart

to allow failing workers finish-up with whatever they are doing and then let them die or force terminate after some timeout.

### reswpawner

to respawn workers, but detect cyclic deaths and either take down app altogether or change response from is_alive 

### management app

to run management app on master (single instance) and allow workers to send messages to an app to report stats, state, whatnot.

This could be achieved with smth like:

```javascript
function Exchange(topic) {
  this.send(msg) // form worker send to master, from master broadcasts to workers
  this.onMessage(msg) // in workers receives from master, from master receives from workers
}
```

So management app in master would have:

```javascript
var consumer = new Exchange('management.app');

consumer.onMessage(function(msg) {
    //update metrics, stats, whatnot
});

```

And clients could do smth like:

```javascript
var consumer = new Exchange('management.app');

consumer.send({
    evt: "req.per.second",
    value: "10"
});

```

### app-scoped workers/data

Idea is to host notifiers/consumers of app-scoped data on cluster as plugins and notify workers on changes or publish data sent by workers to external source.

Some instances:
 - instead of each worker publishing stats by itself, collect messages and publish them from master. If say transoprt is udp as in statsd, then it might not be a big win, but ipc should be faster than network from each worker.
 - RDF - have rdf worker on master, and on data update push data to all workers for them to cache it on process. This could work with Exchange + add-on like:
 
 ```javascript
 rdf = new RDFPlugin() {
    var cache = new ExchangeCache('rdf');
 
    this.onMaster(master, next) {
        rdf.fetch(next);
    }
    this.onWorker(worker, next) {
        global['rdf'] = cache.fetch(next);
    }
 }
 
 ### what else?
