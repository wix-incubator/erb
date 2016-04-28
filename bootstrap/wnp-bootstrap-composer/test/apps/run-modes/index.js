const Composer = require('../../..');

new Composer()
  .express('./test/apps/run-modes/express-app')
  .start();