'use strict';
const composerTestkit = require('wnp-bootstrap-composer-testkit');

module.exports.server = composerTestkit.server;
module.exports.app = (fn, env) => composerTestkit.app(fn, {env, disableCluster: true});
