# wix-cluster-exchange

A way to communicate within node cluster, where `ExchangeClient` allows to:
 - send messages to exchange server, 
 - request data from exchange server,
 - listen on messages form exchange server.

and works both on cluster master and workers.

`ExchangeServer` allows to:
 - listen on messages from exchange clients,
 - listen on data get requests from exchange clients,
 - broadcast messages to all exchange clients.

and works **only** on cluster master.

## install

```js
npm install --save wix-cluster-exchange
```

## usage

**Cluster Master/Worker**
```js
const cluster = require('cluster'),
    wixClusterExchange = require('wix-cluster-exchange');

const topic = 'unique-topic';
    
if (cluster.isMaster) {
const server = wixClusterExchange.server(topic);

server.onMessage(msg => console.log(msg));//will log 'I'm alive'

cluster.fork();//spawns worker process

} else {
    const client = wixClusterExchange.client(topic);
    client.send('I'm alive');//sends message to exchange server on same topic
    //start express server, etc.
}    
```

**Cluster Master/Master**

```js
const cluster = require('cluster'),
    wixClusterExchange = require('wix-cluster-exchange');

const topic = 'unique-topic';
    
if (cluster.isMaster) {
const server = wixClusterExchange.server(topic);
const client = wixClusterExchange.server(topic);

server.onGet(callback => {
    callback('Hi my child');//responds on exchange-clients 'get'
});

cluster.fork().on('online', () => client.get((err, data) => {
    console.log(data);//will log 'Hi my child';
});

} else {
  //start express server, etc.
}    
```

## Api

### client(topic)
Returns new `ExchangeClient` that will be bound to given `topic` - it means if there is corresponding `ExchangeServer` on cluster master, it will receive messages send by this client and vice versa.

Client works both on cluster master and worker.

### server(topic)
Returns new `ExchangeServer` that will be bound to given `topic` - it means if there is corresponding `ExchangeClient` on cluster master/worker, it will receive messages broacasted by this server and vice versa.

### ExchangeClient.send(data)
Send data to a `ExchangeServer` that is running on cluster master and is bound to same topic.

Parameters:
 - data - data to be transmitted. String, Json. 

### ExchangeClient.onMessage(callback)
Listen for messages sent by `ExchangeServer` bound on same topic.

Parameters:
 - callback(data) - function that will receive `data` as single parameter sent, ex. `(data) => console.log(data)`. 

### ExchangeClient.get(callback)
Request for data from `ExchangeMaster` running on master and bound on same topic

Parameters:
 - callback(error, data) - function that will receive `error` if any and `data`, ex. `(err, data) => console.log(data)`. 

### ExchangeServer.onMessage(callback)
Listen for messages sent by `ExchangeClient` bound on same topic.

Parameters:
 - callback(data) - function that will receive `data` as single parameter sent, ex. `(data) => console.log(data)`. 

### ExchangeServer.broadcast(data)
Broadcast data to all `ExchangeClient`s regardless if they run on cluster master or worker.

Parameters:
 - data - data to be transmitted. String, Json. 

### ExchangeServer.onGet(callback)
Respond to `ExchangeClient.get` requests by sending them data.

Parameters:
 - callback with a callback function to use for sending `error`, `data`. Ex. `callback => callback(null, {key: 'value'})`. 