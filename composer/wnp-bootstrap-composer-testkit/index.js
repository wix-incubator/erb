'use strict';
const Server = require('./lib/server'),
  EmbeddedApp = require('./lib/embedded-app');

module.exports.server = (app, opts) => new Server(app, opts || {});
module.exports.app = (app, opts) => new EmbeddedApp(app, opts || {});