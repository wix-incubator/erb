'use strict';
const express = require('express'),
  rpcController = require('./controllers/rpc'),
  aspectsController = require('./controllers/aspects'),
  middlewareByPath = require('./controllers/middleware-bypass'),
  errorsController = require('./controllers/errors'),
  loggingController = require('./controllers/logging'),
  newRelicController = require('./controllers/newrelic');

module.exports = (app, cb) => {
  const router = express.Router();

  app.get('/', (req, res) => res.end());

  errorsController.addTo(app);
  rpcController.addTo(app);
  loggingController.addTo(app);
  middlewareByPath.addTo(app);
  newRelicController.addTo(app);

  aspectsController.addTo(app);
  aspectsController.addTo(router);

  app.use('/router', router);

  cb();
};
