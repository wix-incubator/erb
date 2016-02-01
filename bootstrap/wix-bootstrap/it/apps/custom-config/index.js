'use strict';
const bootstrap = require('../../..');

bootstrap.setup({
  cluster: {
    workerCount: 1
  }
});

bootstrap.run(() => (app, cb) => cb());