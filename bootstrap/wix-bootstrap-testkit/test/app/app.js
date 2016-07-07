'use strict';
module.exports = opts => require('wix-bootstrap-ng')()
  .express('./test/app/express-app')
  .start(opts);
