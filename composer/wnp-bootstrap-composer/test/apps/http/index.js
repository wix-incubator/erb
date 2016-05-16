const Composer = require('../../..').Composer;

new Composer()
  .config('./test/apps/http/config')
  .http('./test/apps/http/ws-app')
  .start();