var JsonRpcRequest = require('json-rpc-request');

var s =new JsonRpcRequest(1, 'subtract', [42, 23]);

console.log(JSON.stringify(s));
