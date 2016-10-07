'use strict';
const EmbeddedApp = require('./lib/embedded-app');

module.exports.checks = require('./lib/checks');

module.exports.fork = (app, opts, isAliveCheck) => {
  return new EmbeddedApp(['node', app], opts, isAliveCheck);
};

module.exports.spawn = (cmdAndArgs, opts, isAliveCheck) => {
  return new EmbeddedApp(cmdAndArgs, opts, isAliveCheck);
};