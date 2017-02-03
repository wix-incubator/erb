const Composer = require('../../..').Composer;

new Composer()
  .express('./test/apps/context/express-app')
  .start();
