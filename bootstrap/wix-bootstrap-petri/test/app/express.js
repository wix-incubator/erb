'use strict';
const express = require('express');

module.exports = config => {
  const app = express();

  app.get('/ok', (req, res) => {
    res.end();
  });

  app.get('/conduct/experiment/:name', (req, res, next) => {
    config.petri(req.aspects)
      .conductExperiment(req.params.name, req.query.fallback)
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/conduct/scope/:scope', (req, res, next) => {
    config.petri(req.aspects)
      .conductAllInScope(req.params.scope)
      .then(resp => res.send(resp))
      .catch(next);
  });


  return app;
};