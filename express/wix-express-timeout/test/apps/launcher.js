'use strict';
require('wix-cluster')
  .builder(require('./app'))
  .withWorkerCount(1)
  .start();