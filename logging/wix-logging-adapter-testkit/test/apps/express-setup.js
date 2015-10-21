'use strict';
const testkit = require('../../');

testkit.express({
  setup: () => console.info('INFO log message is'),
  action: () => {}
});