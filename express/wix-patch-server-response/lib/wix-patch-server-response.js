'use strict';
const httpServer = require('_http_server');
const origWriteHead = httpServer.ServerResponse.prototype.writeHead;

module.exports.patch = () => httpServer.ServerResponse.prototype.writeHead = writeHeaderWrapper;
module.exports.unpatch = () => httpServer.ServerResponse.prototype.writeHead = origWriteHead;

function writeHeaderWrapper() {
  /*jshint validthis:true */
  this.emit('x-before-flushing-headers');
  origWriteHead.apply(this, arguments);
}
