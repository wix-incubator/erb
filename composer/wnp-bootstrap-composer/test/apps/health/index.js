const Composer = require('../../..').Composer;

new Composer({health: {forceDelay: process.env.FORCE_INTERVAL}})
  .express('./test/apps/health/app')
  .start();
