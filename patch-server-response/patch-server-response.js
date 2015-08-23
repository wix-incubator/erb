var http_server = require('_http_server');

var orig_writeHead = http_server.ServerResponse.prototype.writeHead;
http_server.ServerResponse.prototype.writeHead = function() {
  this.emit("before-writing-headers");
  orig_writeHead.apply(this, arguments);
};
