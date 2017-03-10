const bootstrap = require('../../..');

bootstrap()
  .express('./test/apps/default/express-app')
  .start();
