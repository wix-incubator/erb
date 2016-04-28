'use strict';
const express = require('express');

module.exports = config => {
  const app = express();

  app.get('/bi/:id', (req, res, next) => {
    config.biLogger({}).log({evtId: req.params.id})
      .then(() => res.end())
      .catch(next);
  });

  return app;
};