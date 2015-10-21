'use strict';
const testkit = require('wix-logging-adapter-testkit'),
  adapter = require('../../');

testkit.express({
  setup: () => adapter.setup(require('debug')),
  action: () => require('debug')('cat')('log message is')
});