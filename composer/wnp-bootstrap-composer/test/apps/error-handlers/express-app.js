const express = require('express');

module.exports = () => {
  const app = new express.Router();

  app.get('/ok', (req, res) => {
    res.end();
  });


  app.get('/uncaught-exception', (req, res) => {
    res.end();
    process.nextTick(() => {
      throw new Error('uncaught');
    });
  });

  app.get('/unhandled-rejection', (req, res) => {
    Promise.resolve().then(() => {
      res.end();
      throw new Error('unhandled');
    });

  });

  return app;
};
