'use strict';
const bootstrap = require('../../..');

bootstrap()
  .config('./test/apps/context/config.js')
  .express('./test/apps/context/express.js')
  .start();