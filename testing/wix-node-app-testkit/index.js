'use strict';
const embeddedApp = require('./lib/embedded-app'),
  checks = require('./lib/checks'),
  env = require('./lib/env'),
  watch = require('./lib/watcher');

module.exports.embeddedApp = (app, opts, isAliveCheck) => embeddedApp.embeddedApp(app, opts, isAliveCheck);
module.exports.withinApp = (app, opts, isAliveCheck, promise) => embeddedApp.withinApp(app, opts, isAliveCheck, promise);

module.exports.checks = checks;

module.exports.env = env;

module.exports.client = timeout => watch.installOnClient(timeout);