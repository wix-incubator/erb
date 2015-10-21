'use strict';
const testkit = require('wix-logging-adapter-testkit'),
  adapter = require('../../');

testkit.master({
  setup: () => adapter.setup(),
  action: () => console.info('INFO log message is')
});