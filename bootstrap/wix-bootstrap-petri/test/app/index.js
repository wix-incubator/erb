require('wix-bootstrap-ng')()
  .use(require('../..'))
  .config('./test/app/config')
  .express('./test/app/express')
  .start();
