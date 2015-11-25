'use strict';
const _ = require('lodash'),
  wixCluster = require('wix-cluster'),
  wixLoggingPlugin = require('wix-logging-cluster-plugin');

module.exports.setup = () => {};

module.exports.run = function() {
  if (arguments.length <= 0) {
    throw Error('at least one function must be provided for "run"');
  }

  const args = Array.prototype.slice.call(arguments);

  wixCluster
    .builder(bootstrapApp(args))
    .addPlugin(wixLoggingPlugin())
    .start();
};

function bootstrapApp(args) {
  const appFn = args[0];
  const setupFns = _.rest(args);

  setupFns.forEach(setupFn => setupFn());

  return () => require('wix-bootstrap').run(appFn());
}