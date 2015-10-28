# json-rpc-client

## Install
```
    npm install json-rpc-client --save
```

## Usage

```javascript

    
    // Load module
    var RpcClientFactory = require('json-rpc-client');
    
    var defaultRpcClientFactory = new RpcClientFactory();
            
    // You can client object per Url
    var someClient = defaultRpcClientFactory.rpcClient('http://some-url/SomeInterface', 1000 / * timeout */);
    
    //Invoke one of the functions (methodName, varArgs of parameters)
    // returns Promise of response
    var response = someClient.invoke('foo', 'bar', 'baz');        
```


