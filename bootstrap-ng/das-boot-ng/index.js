'use strict';
const bootstrap = require('wix-bootstrap-ng');

bootstrap()
  .use(require('wix-bootstrap-rpc'))
  .use(require('wix-bootstrap-bi'))
  .use(require('wix-bootstrap-petri'))
  .config('./lib/config')
  .express('./lib/express-app')
  .start();