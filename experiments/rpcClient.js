var util = require('util');
var events = require('events');
var EventEmitter = require("events").EventEmitter;
util.inherits(RpcService, events.EventEmitter);

module.exports = function () {
  return new RpcService();      
};

function RpcService(){
  events.EventEmitter.call(this);
}

RpcService.prototype.invoke = function(){
  var headers = {};
  this.emit('rpcInvoke', headers);
  console.log(headers);
};



