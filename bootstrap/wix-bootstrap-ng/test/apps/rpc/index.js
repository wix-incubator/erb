const bootstrap = require('../../..');

bootstrap({rpc: {timeout: process.env.RPC_TIMEOUT}})
  .express('./test/apps/rpc/express-app')
  .start();
