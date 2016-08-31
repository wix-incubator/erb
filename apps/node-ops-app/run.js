'use strict';
require('wix-bootstrap-testkit')
  .server('index', {env: {PORT: 8000}})
  .start()
  .then(() => console.log('server started'));
