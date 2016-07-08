'use strict';
const Composer = require('wnp-bootstrap-composer').Composer;

new Composer()
  .use(require('wnp-bootstrap-config'))
  .use(require('wnp-bootstrap-session'))
  .use(require('../../..'))
  .config('./test/apps/composer/config')
  .express('./test/apps/composer/express')
  .start();