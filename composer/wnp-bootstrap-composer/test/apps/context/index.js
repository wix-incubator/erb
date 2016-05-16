const Composer = require('../../..').Composer;

new Composer()
  .config('./test/apps/context/config')
  .express('./test/apps/context/express-app')
  .start();