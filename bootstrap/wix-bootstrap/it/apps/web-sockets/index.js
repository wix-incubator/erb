'use strict';
const bootstrap = require('../../..');

const opts = {
  cluster: {
    workerCount: 1
  }
};

bootstrap.setup(opts)
  .express('./it/apps/web-sockets/express-app')
  .ws('./it/apps/web-sockets/ws-app')
  .start();