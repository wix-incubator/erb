var events = require('events');

var rpcClient = require('./rpcClient')();



var rpcInvoke = function rpcInvoke(headers)
{   
  headers['foo'] = 'bar';
};


rpcClient.on('rpcInvoke', rpcInvoke);

rpcClient.invoke();



