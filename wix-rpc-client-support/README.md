# RPC client support
Register header hook for sign the rpc client request
 
 
## usage
```javascript

    var signer = require('signer');
    
    
    
    var rpcSupport = require('wix-rpc-client-support')(signer);
    
    var rpcFactory = //// create rpc factory
    rpcSupport.addSupportToRpcClients(rpcFactory) /* var-args */
    

```