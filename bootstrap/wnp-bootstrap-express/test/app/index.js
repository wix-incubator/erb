'use strict';
const Composer = require('wnp-bootstrap-composer');

new Composer({composers: {mainExpress: () => require('../..')({timeout: 1000})}})
  .use(require('wnp-bootstrap-config'))
  .use(require('wnp-bootstrap-session'))
  .express('./test/app/express')
  .start();
