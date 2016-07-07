const Composer = require('../../..').Composer,
  express = require('express');

module.exports = opts => new Composer({
  composers: {
    managementExpress: () => expressAppComposer
  }
}).start(opts);

function expressAppComposer(context, apps) {
  const container = express();
  container.get('/custom-resource', (req, res) => res.send('ok'));
  apps.forEach(app => container.use(app));
  return container;
}