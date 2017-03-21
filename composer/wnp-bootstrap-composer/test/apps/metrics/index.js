const Composer = require('../../..').Composer;

new Composer()
  .express('./test/apps/metrics/express-app')
  .start();
