require('wix-bootstrap-ng')()
  .use(require('../../..'))
  .config('./test/apps/bootstrap/config')
  .express('./test/apps/bootstrap/express')
  .start();
