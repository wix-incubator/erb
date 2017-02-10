const Composer = require('../../..').Composer;

module.exports = opts => new Composer()
  .management('./test/apps/management-app-composer/management-express-app-1-arg')
  .management('./test/apps/management-app-composer/management-express-app-2-args')
  .start(opts);
