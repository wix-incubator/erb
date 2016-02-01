'use strict';
const WebSocketServer = require('ws').Server;

class WixBootstrapWebSockets {
  constructor(appFn) {
    this.appFn = appFn;
  }

  attach(server) {
    server = new WebSocketServer({ server: server, path: process.env.MOUNT_POINT});
    this.appFn()(server);
  }
}

module.exports = WixBootstrapWebSockets;