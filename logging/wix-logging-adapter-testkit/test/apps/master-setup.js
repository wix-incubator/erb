'use strict';
const testkit = require('../../');

testkit.master({
  setup: () => console.info('INFO log message is'),
  action: () => {}
});