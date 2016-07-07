'use strict';
const Composer = require('wnp-bootstrap-composer').Composer;

module.exports = env => new Composer()
  .express('./test/apps/express-app')
  .start(env);