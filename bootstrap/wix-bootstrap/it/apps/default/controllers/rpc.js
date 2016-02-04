'use strict';
const wixBootstrap = require('../../../..');

module.exports.addTo = app => {

  app.get('/rpc/hello/:id', (req, res, next) => {
    rpcClientFor('Contract')
      .invoke('hello', req.params.id)
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/hello-detached/:id', (req, res, next) => {
    const rpcClient = wixBootstrap.rpcClient;
    rpcClient(`http://localhost:${process.env.RPC_SERVER_PORT}`, 'Contract')
      .invoke('hello', req.params.id)
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/req-context', (req, res, next) => {
    rpcClientFor('Aspects')
      .invoke('webContext')
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/bi', (req, res, next) => {
    rpcClientFor('Aspects')
      .invoke('biContext')
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/petri', (req, res, next) => {
    rpcClientFor('Petri')
      .invoke('abExperiment', 'aSpec')
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/wix-session', (req, res, next) => {
    rpcClientFor('Aspects')
      .invoke('securityRequest')
      .then(resp => res.send(resp))
      .catch(next);
  });

  app.get('/rpc/timeout/:timeoutMs', (req, res, next) => {
    rpcClientFor('NonFunctional')
      .invoke('duration', req.params.timeoutMs)
      .then(resp => res.send(resp))
      .catch(next);
  });


  function rpcClientFor(service) {
    return wixBootstrap.rpcClient(`http://localhost:${process.env.RPC_SERVER_PORT}`, service);
  }

};