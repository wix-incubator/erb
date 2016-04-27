# wix-json-rpc-client

Generic JSON-RPC2 client with possibility to attach hooks for:
 - enriching request (headers);
 - extracting information from response (headers).

## Install

```bash
npm install --save wix-json-rpc-client 
```

## usage

```js
const rpcClient = require('wix-json-rpc-client');

// create default factory
const defaultFactory = rpcClient.factory();

// create client factory and create client given you don't have any hooks attached.
const client = defaultFactory.clientFactory('http://localhost:3000/RpcService').client({});
    
// invoke rpc function 'foo' with params 'bar', 'baz'
client.invoke('foo', 'bar', 'baz').then(console.log);
```

In addition you can register hooks that mutate request content/headers:

```js
const rpcClient = require('wix-json-rpc-client');

// create default factory
const defaultFactory = rpcClient.factory();

// register hooks
defaultFactory.registerBeforeRequestHook((headers, requestBody, context) => {
    // add headers, read/process body
});

// get client factory
const clientFactory = defaultFactory.clientFactory('http://localhost:3000/rpcService');
    
// get a client bound to provided context and invoke rpc function 'foo' with params 'bar', 'baz'.
clientFactory.client({}).invoke('foo', 'bar', 'baz').then(console.log);
```

## Api

### factory(options): UnboundedJsonRpcClientFactory
Returns new instance of `JsonRpcClientFactory` object.

Parameters:
 - options: object with possible values:
  - rpcSigningKey - key used to sign requests.
  - timeout: int, ms - json client timeout in milis.
  - callerIdInfo - object containing:
   - artifactId - artifact id of caller;
   - host - hostname of caller.

### JsonRpcClientFactory.registerBeforeRequestHook((requestHeaders, requestBody, context) => {}) : this
Registers a function(s) that will be called before each `JsonRpcClient.invoke` and which are intended to enrich headers if needed.

Passed-in function arguments:
 - requestHeaders: object containing headers to be sent;
 - requestBody: rpc2 request body object;
 - context: if `JsonRpcClient.invoke()` function was called with first argument as `object`, then it's passed in. 

**Note**: registering of hooks applies also for `JsonRpcClient`s created before hook registration.

### JsonRpcClientFactory.registerAfterResponseHook((responseHeaders, context) => {}) : this
Registers a function(s) that will be called after each `JsonRpcClient.invoke` and which can be used to apply then onto `context`.

Passed-in function arguments:
 - responseHeaders: object containing headers that came back;
 - context: if `JsonRpcClient.invoke()` function was called with first argument as `object`, then it's passed in. 

**Note**: registering of hooks applies also for `JsonRpcClient`s created before hook registration.

### JsonRpcClientFactory.clientFactory(absoluteUrl): UnboundedJsonRpcClientFactory
Creates a new `UnboundedJsonRpcClientFactory` bound to provided `absoluteUrl`.

Parameters:
 - absoluteUrl: - absolute rpc service url like 'http://api.aus.wixpress.com/meta-site-manager/ReadOnlyMetaSiteManager'.

### JsonRpcClientFactory.clientFactory(basePath, serviceName) : UnboundedJsonRpcClientFactory
Creates a new `UnboundedJsonRpcClientFactory` with url constructed from 'basePath' and 'serviceName'.

Given you provide baseUrl 'http://api.aus.wixpress.com/meta-site-manager' and serviceName 'ReadOnlyMetaSiteManager', constructed url will be: 'http://api.aus.wixpress.com/meta-site-manager/ReadOnlyMetaSiteManager'.

### UnboundedJsonRpcClientFactory.client(context) : JsonRpcClient
 Creates a new `JsonRpcClient` bound to a provided context that is passed over to registered hooks upon `invoke`.
 
### JsonRpcClient.invoke(method, ...args)
Invokes rpc service, returns a `Promise`.

Parameters:
 - method: string, rpc operation name;
 - args - varargs, rpc operation arguments.