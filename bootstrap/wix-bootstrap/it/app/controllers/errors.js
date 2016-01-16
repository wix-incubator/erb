'use strict';
const express = require('express');

module.exports.addTo = app => {
  const router = express.Router();

  router.use((req, res, next) => {
    res.on('x-error', err => {
      res.status(500).send({name: err.name, message: 'custom-' + err.message});
      next();
    });
    next();
  });

  router.use((req, res, next) => {
    res.once('x-timeout', () => {
      res.status(504).send({name: 'x-timeout', message: 'custom-timeout'});
      next();
    });
    next();
  });

  addTo(app);
  addTo(router);
  app.use('/custom', router);
};

function addTo(app) {
  app.get('/errors/async', req =>
    process.nextTick(() => {
      throw new Error(req.query.m);
    })
  );

  app.get('/errors/sync', req => {
    throw new Error(req.query.m);
  });

  app.get('/errors/timeout', (req, res) => {
    setTimeout(() => res.end(), req.query.ms);
  });
}