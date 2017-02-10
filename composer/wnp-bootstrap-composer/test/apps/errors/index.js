const Composer = require('../../..').Composer;

new Composer()
  .express('./test/apps/errors/express-app')
  .start();
