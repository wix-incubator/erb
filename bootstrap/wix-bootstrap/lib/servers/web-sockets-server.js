'use strict';
const WebSocketServer = require('ws').Server;

class WixBootstrapWebSockets {
  constructor(appFn) {
    this.appFn = appFn;
  }

  attach(server) {
    server = new WebSocketServer({ server: server, path: process.env.MOUNT_POINT});
    const res = this.appFn()(server);
    return (res instanceof Promise) ? res : Promise.resolve();
  }
}

module.exports = WixBootstrapWebSockets;