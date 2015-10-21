'use strict';
const testkit = require('../../');

testkit.express({
  setup: () => {},
  action: () => console.info('INFO log message is')
});