'use strict';
const embeddedApp = require('./lib/embedded-app'),
  checks = require('./lib/checks');

module.exports = embeddedApp;
module.exports.checks = checks;