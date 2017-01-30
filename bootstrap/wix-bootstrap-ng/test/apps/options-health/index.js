const bootstrap = require('../../..');

bootstrap({ health: { forceDelay: process.env.DELAY_OVERRIDE }})
  .express('./test/apps/options-health/express-app')
  .start();
