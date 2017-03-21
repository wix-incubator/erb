module.exports = (app, context) => {

  app.get('/env', (req, res) => res.json(context.env));

  app.post('/client-meter', (req, res) => {
    context.metrics.client.meter(req.query.key)();
    res.end()
  });

  app.post('/factory-meter', (req, res) => {
    context.metrics.factory.collection(req.query.collectionName, req.query.collectionValue).meter(req.query.key)();
    res.end()
  });

  return app;
};
