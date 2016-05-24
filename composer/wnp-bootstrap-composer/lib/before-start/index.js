'use strict';

module.exports.setup = () => {
  require('./env-augmentor').setup(require('wix-run-mode'), require('cluster'), process.env);
  require('./env-validator').setup(process.env);
  require('wix-patch-server-response').patch();
};