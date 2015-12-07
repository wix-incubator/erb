'use strict';

require('wix-bootstrap').setup({
  express: {
    requestTimeout: 1000
  },
  session: {
    mainKey: 'kukuriku_1111111',
    alternateKey: 'kukuriku_1111111'
  },
  rpc: {
    signingKey: '1234567890',
    defaultTimeout: 6000
  }
});

require('wix-bootstrap').run(() => require('./app'));