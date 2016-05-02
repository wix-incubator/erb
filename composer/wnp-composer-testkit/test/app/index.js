'use strict';
const Composer = require('wnp-bootstrap-composer')

new Composer()
  .express('./test/app/app')
  .start();