require('wix-bootstrap-ng')()
  .use(require('../..'))
  .express('./test/app/express')
  .start();
