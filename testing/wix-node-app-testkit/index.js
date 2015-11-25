'use strict';
const EmbeddedApp = require('./lib/embedded-app'),
  checks = require('./lib/checks');

module.exports.embeddedApp = (app, opts, isAliveCheck) => new EmbeddedApp(app, opts, isAliveCheck);
module.exports.checks = checks;