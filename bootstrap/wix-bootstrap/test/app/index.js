'use strict';
const bootstrap = require('../..');

bootstrap.setup({
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

bootstrap.run(() => require('./app'));