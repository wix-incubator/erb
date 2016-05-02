const Composer = require('../../..');

new Composer()
  .config('./test/apps/config/config')
  .express('./test/apps/config/express-app')
  .start();