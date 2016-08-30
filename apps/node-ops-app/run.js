'use strict';
require('wix-bootstrap-testkit')
  .server('index')
  .start()
  .then(() => console.log('server started'));
