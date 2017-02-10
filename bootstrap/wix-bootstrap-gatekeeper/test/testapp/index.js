require('wix-bootstrap-ng')()
  .use(require('wix-bootstrap-rpc'))
  .use(require('../..'))
  .config('./test/testapp/config')
  .express('./test/testapp/express')
  .start();
