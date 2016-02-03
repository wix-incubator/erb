'use strict';
const bootstrap = require('../../..');

bootstrap.setup({cluster: {workerCount: 1}})
  .express('./it/apps/promisified-init/express-app')
  .start();