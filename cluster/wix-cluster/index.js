'use strict';
const wixCluster = require('./lib/wix-cluster'),
  join = require('path').join;

module.exports = wixCluster;
module.exports.workerShutdown = require('./lib/worker-shutdown');


module.exports.run = (app, opts) => {
  const options = opts || {};
  delete options.managementApp;
  delete options.withoutDefaultPlugins;
  delete options.plugins;
  options.app = require(join(process.cwd(), app));

  wixCluster(options).start();
};