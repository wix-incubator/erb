const composerTestkit = require('wnp-bootstrap-composer-testkit');

module.exports.server = composerTestkit.server;

module.exports.app = (appFile, opts) => {
  process.env.WIX_BOOT_DISABLE_MODULES = 'runner';
  return composerTestkit.app(appFile, opts);
};
