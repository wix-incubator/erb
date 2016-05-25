const Composer = require('../../..').Composer;

new Composer()
  .express('./test/apps/error-handlers/express-app')
  .start();