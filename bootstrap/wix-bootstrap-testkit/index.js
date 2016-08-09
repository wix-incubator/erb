'use strict';
const composerTestkit = require('wnp-bootstrap-composer-testkit');

module.exports.server = composerTestkit.server;

module.exports.app = (appFile, opts) => {
  process.env['WIX-BOOT-DISABLE-MODULES'] = 'runner';
  return composerTestkit.app(appFile, opts);
};

module.exports.fn = composerTestkit.fn;