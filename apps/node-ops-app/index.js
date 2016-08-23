'use strict';
const composer = require('./lib/composer');

composer()
  .express('./lib/express-app')
  .start();