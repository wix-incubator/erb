const Server = require('./lib/server'),
  EmbeddedServer = require('./lib/embedded-server');

module.exports.server = (app, opts) => new Server(app, opts || {});
module.exports.app = (app, opts) => {
  process.env.WIX_BOOT_DISABLE_MODULES = 'runner';
  return new EmbeddedServer(app, opts || {});
};
