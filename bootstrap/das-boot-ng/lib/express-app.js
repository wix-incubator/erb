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
    const bi = config.bi(req.aspects);
    bi.log({evid: 300})
      .then(() => res.send(req.aspects))
      .catch(next);
  });

  app.get('/rpc/site/:id', (req, res, next) => {
    config.rpc.metasite(req.aspects).getMetasite(req.params.id)
      .then(response => res.send(response))
      .catch(next);
  });

  app.get('/petri/:spec/:fallback', (req, res, next) => {
    config.petri(req.aspects)
      .conductExperiment(req.params.spec, req.params.fallback)
      .then(resp => res.send(resp))
      .catch(next);
  });
  
  app.get('/gatekeeper/:metasite/:scope/:action', (req, res, next) => {
    config.gatekeeper(req.aspects)
      .authorize(req.params.metasite, {scope: req.params.scope, action: req.params.action})
      .then(() => res.status(201).end())
      .catch(next);
  });

  return new express.Router().use('/api', app);
};
