'use strict';
const express = require('express');

module.exports = config => {
  const rpcClientFor = (service, aspects) => config.rpc
    .clientFactory(`http://localhost:${process.env.RPC_SERVER_PORT}`, service)
    .client(aspects);

  const app = express();

  app.get('/rpc/without-aspects', (req, res, next) => {
    rpcClientFor('Contract')
      .invoke('hello', req.params.id)
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/hello/:id', (req, res, next) => {
    rpcClientFor('Contract', req.aspects)
      .invoke('hello', req.params.id)
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/req-context', (req, res, next) => {
    rpcClientFor('Aspects', req.aspects)
      .invoke('webContext')
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/bi', (req, res, next) => {
    rpcClientFor('Aspects', req.aspects)
      .invoke('biContext')
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/caller-id', (req, res, next) => {
    rpcClientFor('Aspects', req.aspects)
      .invoke('callerId')
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/petri/experiment/:spec', (req, res, next) => {
    rpcClientFor('Petri', req.aspects)
      .invoke('abExperiment', req.params['spec'])
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/petri/auth-experiment/:spec', (req, res, next) => {
    rpcClientFor('Petri', req.aspects)
      .invoke('authenticatedAbExperiment', req.params['spec'])
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/petri/clear', (req, res, next) => {
    rpcClientFor('Petri', req.aspects)
      .invoke('clear')
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/wix-session', (req, res, next) => {
    rpcClientFor('Aspects', req.aspects)
      .invoke('securityRequest')
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/timeout/:timeoutMs', (req, res, next) => {
    rpcClientFor('NonFunctional', req.aspects)
      .invoke('duration', req.params.timeoutMs)
      .then(resp => res.json(resp))
      .catch(next);
  });

  return app;
};