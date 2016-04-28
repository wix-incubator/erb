const Composer = require('../../..');

new Composer()
  .config('./test/apps/http/config')
  .http('./test/apps/http/ws-app')
  .start();