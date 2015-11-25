'use strict';
const express = require('express'),
  wixReqContext = require('wix-req-context'),
  wixPetri = require('wix-petri'),
  wixSession = require('wix-session'),
  wixBootstrap = require('wix-bootstrap'),
  uuid = require('uuid-support'),
  log = require('log4js').getLogger('app');

module.exports = app => {
  const router = express.Router();

  app.use((req, res, next) => {
    res.on('x-error', err => res.status(500).send({name: 'x-error', message: err.message}));
    next();
  });

  app.use((req, res, next) => {
    res.once('x-timeout', () => res.status(503).send({name: 'x-timeout', message: 'timeout'}));
    next();
  });

  fill(app);
  fill(router);
  app.use('/router', router);

  return app;
};

function fill(app) {
  app.get('/', (req, res) => res.end());
  app.get('/req-context', (req, res) => res.send(wixReqContext.get()));
  app.get('/petri', (req, res) => res.send(wixPetri.get()));
  app.get('/wix-session', (req, res) => res.send(wixSession.get()));

  app.get('/async-error', () => setTimeout(() => {
    throw new Error('async');
  }, 5));

  app.get('/sync-error', () => {
    throw new Error('sync');
  });

  app.get('/timeout-1500', (req, res) => setTimeout(() => {
    res.end();
  }, 1500));

  app.get('/rpc', (req, res) => {
    wixBootstrap
      .rpcClient(`http://localhost:${process.env.RPC_SERVER_PORT}/RpcServer`)
      .invoke('hello', uuid.generate())
      .then(
        resp => res.send(resp),
        err => {
          console.log(err);
          res.status(500).send({message: err.message, name: err.name, stack: err.stack})
        }
      );
  });

  app.get('/log-info', (req, res) => {
    log.info('from request');
    res.end();
  });
}