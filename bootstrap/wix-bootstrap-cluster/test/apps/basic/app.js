'use strict';
const wixBootstrap = require('wix-bootstrap');

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

module.exports = app => {
  app.get('/', (req, res) => res.end());

  return app;
};