const bootstrap = require('../../..');

bootstrap()
  .express('./test/apps/metering/metering-app')
  .start();
