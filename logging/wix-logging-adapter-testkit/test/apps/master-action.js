'use strict';
const testkit = require('../../');

testkit.master({
  setup: () => {},
  action: () => console.info('INFO log message is')
});