require('wix-bootstrap-ng')()
  .use(require('wix-bootstrap-bi'))
  .use(require('../..'))
  .express('./test/app/express')
  .start();
