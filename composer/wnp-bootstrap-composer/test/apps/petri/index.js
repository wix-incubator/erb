const Composer = require('../../..').Composer;

new Composer()
  .express('./test/apps/petri/express-app')
  .start();
