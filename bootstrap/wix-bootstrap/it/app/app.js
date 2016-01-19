'use strict';
const express = require('express'),
  rpcController = require('./controllers/rpc'),
  aspectsController = require('./controllers/aspects'),
  errorsController = require('./controllers/errors'),
  loggingController = require('./controllers/logging');

require('wix-logging-log4js-adapter').setup(require('log4js'));

module.exports = (app, cb) => {
  const router = express.Router();

  app.use((req, res, next) => {
    res.on('x-error', err => res.status(500).send({name: err.name, message: err.message}));
    next();
  });

  app.use((req, res, next) => {
    res.once('x-timeout', () => res.status(503).send({name: 'x-timeout', message: 'timeout'}));
    next();
  });

  app.get('/', (req, res) => res.end());

  rpcController.addTo(app);

  aspectsController.addTo(app);
  aspectsController.addTo(router);

  errorsController.addTo(app);

  loggingController.addTo(app);


  app.use('/router', router);

  cb();
};
