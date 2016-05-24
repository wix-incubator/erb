const Composer = require('../../..').Composer;

new Composer()
  .express('./test/apps/config/express-app')
  .start();