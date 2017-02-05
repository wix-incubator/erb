const Composer = require('wnp-bootstrap-composer').Composer;

new Composer({composers: {mainExpress: () => require('../..')({timeout: 1000})}})
  .express('./test/app/express-app')
  .express('./test/app/express-app-custom')
  .start();
