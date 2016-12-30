const Composer = require('../../..').Composer,
  express = require('express');

module.exports = opts => new Composer({composers: {managementExpress: () => expressAppComposer}})
  .management('./test/apps/management-app-composer/management-express-app-1-arg')
  .management('./test/apps/management-app-composer/management-express-app-2-args')
  .start(opts);

function expressAppComposer(context, appFns) {
  const container = express();
  container.use((req, res, next) => {
    res.append('warning', 'from management composer');
    next();
  });

  return Promise.all(appFns.map(appFn => Promise.resolve().then(() => {
    const forApp = express();
    forApp.use((req, res, next) => {
      res.append('per-app', 'ok');
      next();
    });

    return appFn(forApp);
  })))
    .then(apps => apps.forEach(app => container.use(app)))
    .then(() => container);
}
