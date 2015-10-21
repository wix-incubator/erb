'use strict';
const testkit = require('wix-logging-adapter-testkit'),
  adapter = require('../../');

testkit.master({
  setup: () => adapter.setup(require('log4js')),
  action: () => require('log4js').getLogger().info('log message is')
});