require('wix-bootstrap-ng')()
  .use(require('../..'))
  .express('./test/app/test-app')
  .start();
