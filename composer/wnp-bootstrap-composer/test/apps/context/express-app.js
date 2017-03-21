module.exports = (app, context) => {

  app.get('/env', (req, res) => res.json(context.env));
  app.get('/app', (req, res) => res.json(context.app));
  
  app.get('/config/:name', (req, res) => res.json(context.config.load(req.params.name)));

  app.get('/session', (req, res) => res.json(context.session.decrypt(req.query.token)));
  
  app.get('/newrelic', (req, res) => res.json({
    reqTimingHeaders: context.newrelic.getBrowserTimingHeader(),
    appTimingHeaders: context.newrelic.getBrowserTimingHeader()
  }));

  return app;
};
