const bootstrap = require('../../..');

bootstrap()
  .express('./test/apps/express/express-app')
  .start();
