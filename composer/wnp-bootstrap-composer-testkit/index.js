'use strict';
const Server = require('./lib/server'),
  EmbeddedApp = require('./lib/embedded-app'),
  EmbeddedServer = require('./lib/embedded-server');

module.exports.server = (app, opts) => new Server(app, opts || {});
module.exports.app = (app, opts) => new EmbeddedServer(app, opts || {});
module.exports.fn = (app, opts) => new EmbeddedApp(app, opts || {});
