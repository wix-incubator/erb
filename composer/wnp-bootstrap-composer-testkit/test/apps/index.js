const Composer = require('wnp-bootstrap-composer').Composer;

new Composer()
  .express('./test/apps/express-app')
  .start();
