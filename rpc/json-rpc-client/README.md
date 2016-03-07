# json-rpc-client

Generic JSON-RPC2 client with possibility to attach hooks for:
 - enriching request (headers);
 - extracting information from response (headers).

## Install

```bash
npm install --save json-rpc-client 
```

## usage

```js
const rpcClient = require('json-rpc-client');

// create default factory
const defaultFactory = rpcClient.factory();

// get client
const client = defaultFactory.client('http://localhost:3000/RpcService');
    
// invoke rpc function 'foo' with params 'bar', 'baz'
client.invoke('foo', 'bar', 'baz').then(console.log);
```

In addition you can register hooks that mutate request content/headers:

```js
const rpcClient = require('json-rpc-client');

// create default factory
const defaultFactory = rpcClient.factory();

// register hooks
defaultFactory.registerBeforeRequestHook((headers, requestBody, context) => {
    // add headers, read/process body
});

// get client
const client = defaultFactory.client('http://localhost:3000/rpcService');
    
// invoke rpc function 'foo' with params 'bar', 'baz' and context object as first argument that is passed to hooks.
client.invoke({}, 'foo', 'bar', 'baz').then(console.log);
```

## Api

### factory(options)
Returns new instance of `JsonRpcClientFactory` object.

Parameters:
 - options: object with possible values:
  - rpcSigningKey - key used to sign requests.
  - timeout: int, ms - json client timeout in milis.
  - callerIdInfo - object containing:
   - artifactId - artifact id of caller;
   - host - hostname of caller.

### JsonRpcClientFactory.registerBeforeRequestHook((requestHeaders, requestBody, context) => {})
Registers a function(s) that will be called before each `JsonRpcClient.invoke` and which are intended to enrich headers if needed.

Passed-in function arguments:
 - requestHeaders: object containing headers to be sent;
 - requestBody: rpc2 request body object;
 - context: if `JsonRpcClient.invoke()` function was called with first argument as `object`, then it's passed in. 

**Note**: registering of hooks applies also for `JsonRpcClient`s created before hook registration.

### JsonRpcClientFactory.registerAfterResponseHook((responseHeaders, context) => {})
Registers a function(s) that will be called after each `JsonRpcClient.invoke` and which can be used to apply then onto `context`.

Passed-in function arguments:
 - responseHeaders: object containing headers that came back;
 - context: if `JsonRpcClient.invoke()` function was called with first argument as `object`, then it's passed in. 

**Note**: registering of hooks applies also for `JsonRpcClient`s created before hook registration.

### JsonRpcClientFactory.client(absoluteUrl)
Creates a new `JsonRpcClient` bound to provided `absoluteUrl`.

Parameters:
 - absoluteUrl: - absolute rpc service url like 'http://api.aus.wixpress.com/meta-site-manager/ReadOnlyMetaSiteManager'.

## JsonRpcClientFactory.client(basePath, serviceName)
Creates a new `JsonRpcClient` with url constructed from 'basePath' and 'serviceName'.

Given you provide baseUrl 'http://api.aus.wixpress.com/meta-site-manager' and serviceName 'ReadOnlyMetaSiteManager', constructed url will be: 'http://api.aus.wixpress.com/meta-site-manager/ReadOnlyMetaSiteManager'.
 
### JsonRpcClient.invoke(method, ...args)
Invokes rpc service, returns a `Promise`.

Parameters:
 - method: string, rpc operation name;
 - args - varargs, rpc operation arguments.

### JsonRpcClient.invoke(context, method, ...args)
Invokes rpc service, returns a `Promise`.

Parameters:
 - context: object, passed over to hook functions;
 - method: string, rpc operation name;
 - args - varargs, rpc operation arguments.
