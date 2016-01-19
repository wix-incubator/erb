'use strict';
const express = require('express'),
  rpcController = require('./controllers/rpc'),
  aspectsController = require('./controllers/aspects'),
  errorsController = require('./controllers/errors'),
  loggingController = require('./controllers/logging');

require('wix-logging-log4js-adapter').setup(require('log4js'));

module.exports = (app, cb) => {
  const router = express.Router();

  app.get('/', (req, res) => res.end());

  rpcController.addTo(app);

  aspectsController.addTo(app);
  aspectsController.addTo(router);

  errorsController.addTo(app);

  loggingController.addTo(app);


  app.use('/router', router);

  cb();
};
