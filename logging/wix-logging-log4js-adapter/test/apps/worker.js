'use strict';
const testkit = require('wix-logging-adapter-testkit'),
  adapter = require('../../');

testkit.worker({
  setup: () => adapter.setup(require('log4js')),
  action: () => require('log4js').getLogger().info('log message is')
});