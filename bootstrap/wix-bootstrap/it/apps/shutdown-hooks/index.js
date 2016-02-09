'use strict';
const bootstrap = require('../../..');

bootstrap
  .setup({ cluster: { workerCount: 1 } })
  .express('./it/apps/shutdown-hooks/express-app')
  .start();