'use strict';
const wixBootstrap = require('wix-bootstrap');

require('wix-logging-log4js-adapter').setup(require('log4js'));

wixBootstrap.setup({
  express: {
    requestTimeout: 1000
  },
  session: {
    mainKey: 'kukuriku_1111111'
  },
  rpc: {
    signingKey: '1234567890',
    defaultTimeout: 6000
  }
});