const Composer = require('wnp-bootstrap-composer').Composer;

new Composer({composers: {mainExpress: () => require('wnp-bootstrap-express')()}})
  .use(require('wnp-bootstrap-config'))
  .use(require('wnp-bootstrap-session'))
  .use(require('wix-bootstrap-rpc'))
  .use(require('../..'))
  .config('./test/testapp/config')
  .express('./test/testapp/express')
  .start();
