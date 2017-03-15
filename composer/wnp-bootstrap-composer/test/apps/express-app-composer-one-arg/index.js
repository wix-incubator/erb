const Composer = require('../../..').Composer;

new Composer()
  .express('./test/apps/express-app-composer-one-arg/express-app-1-arg')
  .start();
