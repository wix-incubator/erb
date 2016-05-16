const Composer = require('../../..').Composer;

new Composer()
  .express('./test/apps/express/express-app')
  .start();