exports.config = {
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
