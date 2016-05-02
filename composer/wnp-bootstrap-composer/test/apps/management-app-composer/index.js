const Composer = require('../../..'),
  express = require('express');

new Composer({
  composers: {
    managementExpress: () => expressAppComposer
  }
}).start();

function expressAppComposer(context, apps) {
  const container = express();
  container.get('/custom-resource', (req, res) => res.send('ok'));
  apps.forEach(app => container.use(app));
  return container;
}