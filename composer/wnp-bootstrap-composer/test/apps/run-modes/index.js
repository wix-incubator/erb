const Composer = require('../../..').Composer;

new Composer()
  .express('./test/apps/run-modes/express-app')
  .start();