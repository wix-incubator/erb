const bootstrap = require('../../..');

bootstrap({ express: { timeout: 200 }})
  .express('./test/apps/options-express/express-app')
  .start();
