'use strict';
const bootstrap = require('../../..');

bootstrap()
  .express('./test/apps/statsd/express-app')
  .start();