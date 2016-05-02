const Composer = require('../../..');

new Composer()
  .express('./test/apps/express/express-app')
  .start();