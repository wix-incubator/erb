'use strict';
const bootstrap = require('../../..');

bootstrap({
  cluster: {
    workerCount: 1
  }
}).start();