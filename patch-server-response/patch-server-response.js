var http_server = require('_http_server');

var orig_writeHead = http_server.ServerResponse.prototype.writeHead;

function writeHeaderWrapper() {
  this.emit("x-before-flushing-headers");
  orig_writeHead.apply(this, arguments);
}

module.exports.patch = function() {
  http_server.ServerResponse.prototype.writeHead = writeHeaderWrapper;
}

module.exports.unpatch = function() {
  http_server.ServerResponse.prototype.writeHead = orig_writeHead;
}
