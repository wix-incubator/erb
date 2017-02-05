'use strict';
const Composer = require('wnp-bootstrap-composer').Composer;

new Composer({composers: {mainExpress: () => require('wnp-bootstrap-express')()}})
  .use(require('wix-bootstrap-rpc'))
  .use(require('../..'))
  .config('./test/app/config')
  .express('./test/app/express')
  .start();
