# json-rpc-client

Generic JSON-RPC2 client with possibility to attach hooks which enable us to enable wix-specific extensions.

## Install

```
npm install --save json-rpc-client 
```

## usage

```js
const rpcClient = require('json-rpc-client');

// create default factory
const defaultFactory = rpcClient.factory();

// get client
const client = defaultFactory.client('http://localhost:3000/rpcService', 1000);
    
// invoke rpc function 'foo' with params 'bar', 'baz'
client.invoke('foo', 'bar', 'baz').then(console.log);
```

In addition you can register hooks that mutate request content/headers:

```js
const rpcClient = require('json-rpc-client');

// create default factory
const defaultFactory = rpcClient.factory();

//register hooks
rpcClient.factory().registerHeaderBuildingHook((headers, requestBody) => {
//add headers, read/process body
});

// get client
const client = defaultFactory.client('http://localhost:3000/rpcService', 1000);
    
// invoke rpc function 'foo' with params 'bar', 'baz'
client.invoke('foo', 'bar', 'baz').then(console.log);
```

## Api

### factory()
Returns new instance of `JsonRpcClientFactory` object.

### JsonRpcClientFactory.registerHeaderBuildingHook(fn)
Registers a function(s) that will be called before each `JsonRpcClient.invoke` and which are intended to enrich headers if needed.

**Note**: registering of hooks applies also for `JsonRpcClient`s created before hook registration.

### JsonRpcClientFactory.client(url, timeout)
Creates a new `JsonRpcClient` bound to provided `url` and having `timeout`.

Parameters:
 - url: string, fully qualified rpc service url, ex. 'http://localhost:3000/rpcService';
 - timeout: ms, request timeout.

### JsonRpcClient.invoke(method, arguments)
Invokes rpc service, returns a `Promise`.

Parameters:
 - method: string, rpc operation name;
 - arguments - varargs, rpc operation arguments.