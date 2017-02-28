const bootstrap = require('wix-bootstrap-ng');

const opts = process.env.NODE_ENV === 'production' ? {} : {health: {forceDelay: 100}}; 

bootstrap(opts)
  .use(require('wix-bootstrap-bi'))
  .use(require('wix-bootstrap-gatekeeper'))
  .config('./lib/config')
  .express('./lib/express-app')
  .express('./lib/express-errors')
  .express('./lib/express-health')
  .start();
