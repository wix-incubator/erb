'use strict';
const Composer = require('wnp-bootstrap-composer').Composer;

new Composer()
  .express('./test/app/app')
  .start();