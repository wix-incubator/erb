'use strict';
const testkit = require('wix-logging-adapter-testkit'),
  adapter = require('../../');

testkit.worker({
  setup: () => adapter.setup(),
  action: () => console.info('INFO log message is')
});