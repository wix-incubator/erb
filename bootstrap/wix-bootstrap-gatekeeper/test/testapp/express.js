const express = require('express');

module.exports = config => {
  const app = express();

  app.get('/authorize', (req, res, next) => {
    const metasiteId = req.query.metasite;
    const permission = {scope: req.query.scope, action: req.query.action};
    config.gatekeeper(req.aspects)
      .authorize(metasiteId, permission)
      .then(() => res.status(201).end())
      .catch(next);
  });

  return app;
};
