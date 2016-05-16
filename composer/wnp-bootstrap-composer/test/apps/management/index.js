const Composer = require('../../..').Composer;

new Composer()
  .management('./test/apps/management/management-app')
  .start();