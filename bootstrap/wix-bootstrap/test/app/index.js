'use strict';
const wixBootstrap = require('../..');

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
  }
);

wixBootstrap.run(app => {
  app.get('/', (req, res) => res.end());
  return app;
});