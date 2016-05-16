const Composer = require('../../..').Composer;

new Composer()
  .use(require('./plugin'))
  .config('./test/apps/plugin/config')
  .express('./test/apps/plugin/express-app')
  .start();