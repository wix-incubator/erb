'use strict';
const express = require('express');

module.exports = config => {
  const app = new express.Router();
  
  app.get('/hello', (req, res) => {
    setTimeout(() => res.send('hi'), 50);
  });

  app.get('/die', () => {
    process.nextTick(() => {
      throw new Error('woop');
    });
  });

  app.get('/bi/event', (req, res, next) => {
    const bi = config.biLogger(req.aspects);
    bi.log({evid: 300})
      .then(() => res.send(req.aspects))
      .catch(next);
  });

  app.get('/rpc/site/:id', (req, res, next) => {
    config.rpc.metasite(req.aspects).getMetasite(req.params.id)
      .then(response => res.send(response))
      .catch(next);
  });
  
  return app;
};