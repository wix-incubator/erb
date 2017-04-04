/*global browser*/
const path = require('path');

exports.config = {
  chromeDriver: path.resolve('node_modules/chromedriver/bin/chromedriver'),
  framework: 'mocha',
  specs: ['test/**/*.e2e.js'],
  mochaOpts: { reporter: 'mocha-env-reporter' },
  directConnect: true,
  capabilities: {
    browserName: 'chrome'
  },
  onPrepare: () => {
    browser.ignoreSynchronization = true;
  }
};
