'use strict';
const testkit = require('../../');

testkit.worker({
  setup: () => {},
  action: () => console.info('INFO log message is')
});