const Composer = require('../../..').Composer,
  express = require('express');

module.exports = opts => new Composer({composers: {mainExpress: () => expressAppComposer}})
  .express('./test/apps/express-app-composer/express-app')
  .start(opts);

function expressAppComposer(context, appFns) {
  const container = express();
  container.use((req, res, next) => {
    res.append('warning', 'from composer');
    next();
  });

  return Promise.all(appFns.map(appFn => Promise.resolve().then(() => appFn(express()))))
    .then(apps => apps.forEach(app => container.use(app)))
    .then(() => container);
}
