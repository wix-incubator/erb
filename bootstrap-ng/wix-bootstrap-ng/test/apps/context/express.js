'use strict';
const express = require('express');

module.exports = config => {
  const app = express();

  app.get('/config/:name', (req, res) => {
    res.json(config.config.load(req.params.name));
  });

  app.get('/session', (req, res) => {
    res.json(config.session.decrypt(req.query.token));
  });

  app.get('/newrelic', (req, res) => res.json({
    reqTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader(),
    appTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader()
  }));

  return app;
};