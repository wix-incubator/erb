const Composer = require('../../..'),
  express = require('express');

new Composer({
  composers: {
    mainExpress: () => expressAppComposer
  }
}).express('./test/apps/express-app-composer/express-app')
  .start();

function expressAppComposer(context, apps) {
  const container = express();
  container.use((req, res, next) => {
    res.append('warning', 'from composer');
    next();
  });

  apps.forEach(app => container.use(app));
  return container;
}