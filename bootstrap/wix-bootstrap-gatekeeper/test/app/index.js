require('wix-bootstrap-ng')()
  .use(require('wix-bootstrap-rpc'))
  .use(require('../..'))
  .config('./test/app/config')
  .express('./test/app/express')
  .start();
