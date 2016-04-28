const Composer = require('../../..');

new Composer()
  .management('./test/apps/management/management-app')
  .start();