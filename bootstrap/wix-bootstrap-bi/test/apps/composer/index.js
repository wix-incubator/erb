'use strict';
const Composer = require('wnp-bootstrap-composer').Composer;

new Composer()
  .use(require('../../..'))
  .config('./test/apps/composer/config')
  .express('./test/apps/composer/express')
  .start();
