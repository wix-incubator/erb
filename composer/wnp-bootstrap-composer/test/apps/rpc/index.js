const Composer = require('../../..').Composer;

new Composer({rpc: {timeout: process.env.RPC_TIMEOUT}})
  .express('./test/apps/rpc/express-app')
  .start();
