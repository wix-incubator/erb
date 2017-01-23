const Server = require('./lib/server'),
  EmbeddedServer = require('./lib/embedded-server');

module.exports.server = (app, opts) => new Server(app, opts || {});
module.exports.app = (app, opts) => new EmbeddedServer(app, opts || {});
