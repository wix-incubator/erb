module.exports = (app, context) => {
  app.get('/authorize', (req, res, next) => {
    const metasiteId = req.query.metasite;
    const permission = {scope: req.query.scope, action: req.query.action};
    context.gatekeeper.client(req.aspects)
      .authorize(metasiteId, permission)
      .then(() => res.status(201).end())
      .catch(next);
  });

  const permission = {scope: 'aScope', action: 'anAction'};
  const gkMiddleware = context.gatekeeper.middleware(permission)(req => req.query.metasite);

  app.get('/authorizeWithMiddleware', gkMiddleware, (req, res) => {
    res.status(201).end();
  });

  return app;
};
