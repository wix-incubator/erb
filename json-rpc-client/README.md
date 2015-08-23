# json-rpc-client

## Install
```
    npm install json-rpc-client --save
```

## Usage

```javascript

    // load the signer
    var signer = require('signer')('key');
    
    
    // Load module
    var rpcFactory = require('json-rpc-client')(signer);
            
    // You can client object per Url
    var someClient = rpcFactory.rpcClient('http://some-url/SomeInterface', 1000 / * timeout */);
    
    //Invoke one of the functions (methodName, varArgs of parameters)
    // returns Promise of response
    var response = someClient.invoke('foo', 'bar', 'baz');        
```


