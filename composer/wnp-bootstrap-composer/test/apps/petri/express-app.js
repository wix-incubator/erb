module.exports = (app, context) => {
  const petriClient = aspects => context.petri.client(aspects);
  
  app.get('/conduct/experiment/:name', (req, res, next) => {
    petriClient(req.aspects)
      .conductExperiment(req.params.name, req.query.fallback)
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/conduct/scope/:scope', (req, res, next) => {
    petriClient(req.aspects)
      .conductAllInScope(req.params.scope)
      .then(resp => res.send(resp))
      .catch(next);
  });

  return app;
};
