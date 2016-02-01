'use strict';
const bootstrap = require('../../..');

bootstrap.setup({
  rpc: {
    defaultTimeout: 700
  },
  requestContext: {
    seenByInfo: 'seen-by-Villus'
  }
});

bootstrap.run(() => require('./app'));