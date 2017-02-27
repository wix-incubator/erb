const express = require('express');

module.exports = thenableFn => {
  const app = new express.Router();
  app.post('/sync-specs', (req, res) => {
    thenableFn()
      .then(result => res.status(200).json(result).end())
      .catch(err => res.status(500).send(err.message).end());
  });
  return app;
};
