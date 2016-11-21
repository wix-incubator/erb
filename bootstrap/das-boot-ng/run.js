'use strict';
require('wix-bootstrap-testkit')
  .server('index', {env: {PORT: 8000, APP_CONF_DIR: 'test/configs'}})
  .start()
  .then(() => console.log('server started'));
