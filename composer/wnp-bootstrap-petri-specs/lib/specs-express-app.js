const express = require('express');

module.exports = thenableFn => {
  const app = new express.Router();
  app.post('/sync-specs', (req, res, next) => {
    thenableFn()
      .then(result => res.status(200).json(result).end())
      .catch(next);
  });
  return app;
};
