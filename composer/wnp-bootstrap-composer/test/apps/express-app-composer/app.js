const Composer = require('../../..').Composer,
  express = require('express');

module.exports = opts => new Composer({
  composers: {
    mainExpress: () => expressAppComposer
  }
}).express('./test/apps/express-app-composer/express-app')
  .start(opts);

function expressAppComposer(context, apps) {
  const container = express();
  container.use((req, res, next) => {
    res.append('warning', 'from composer');
    next();
  });

  apps.forEach(app => container.use(app));
  return container;
}