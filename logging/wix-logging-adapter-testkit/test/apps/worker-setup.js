'use strict';
const testkit = require('../../');

testkit.worker({
  setup: () => console.info('INFO log message is'),
  action: () => {}
});