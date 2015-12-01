'use strict';
const bootstrap = require('./lib/wix-bootstrap');

module.exports.setup = bootstrap.setup;
module.exports.run = bootstrap.run;
module.exports.rpcClient = bootstrap.rpcClient;