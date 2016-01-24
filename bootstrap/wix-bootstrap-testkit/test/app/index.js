'use strict';

require('wix-bootstrap').setup({
  express: {
    requestTimeout: 1000
  },
  session: {
    mainKey: '1qaz2wsx3edc4rfv',
    alternateKey: '1qaz2wsx3edc4rfv'
  },
  rpc: {
    signingKey: '1234567890',
    defaultTimeout: 6000
  },
  requestContext: {
    seenByInfo: 'seen-by-Kfir'
  }

});

require('wix-bootstrap').run(() => require('./app'));