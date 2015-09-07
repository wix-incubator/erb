# wix-cluster-exchange

A way to communicate within node cluster.

## ExchangeClient
 
Allows to:
 - send messages to exchange server, 
 - request data from exchange server,
 - listen on messages form exchange server.

works both on cluster master and workers.
 
```js
var exchange = require('wix-cluster-exchange'),
    client = exchange.client('my-topic');

client.send({key: 'value'});

client.get(function(err, data) {
    console.log(data);
});

client.onMessage(function(data) {
    console.log(data);
});
```

## ExchangeServer

Allows to:
 - listen on messages from exchange clients,
 - listen on data get requests from exchange clients,
 - broadcast messages to all exchange clients.
 
```js
var exchange = require('wix-cluster-exchange'),
    server = exchange.server('my-topic');

server.onMessage(function(data) {
    console.log(data);
});

server.onGet(function(callback) {
    callback(null, {key: 'value'});
});

server.broadcast({key: 'value'});
```