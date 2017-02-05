'use strict';
const Composer = require('wnp-bootstrap-composer').Composer;

new Composer({composers: {mainExpress: () => require('wnp-bootstrap-express')()}})
  .use(require('../..'), {timeout: parseInt(process.env.RPC_TIMEOUT)})
  .config('./test/app/config')
  .express('./test/app/express')
  .start();
