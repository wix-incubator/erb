const Composer = require('../../..').Composer;

new Composer({ express: { timeout: 200 }})
  .express('./test/apps/express-options/express-app')
  .start();
