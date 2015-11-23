'use strict';
const wixCluster = require('wix-cluster');


module.exports.handler = handlerMiddleware;
module.exports.internalServerErrorPage = defaultInternalServerErrorPage;
module.exports.gatewayTimeoutPage = defaultGatewayTimeoutPage;

function handlerMiddleware (req, res, next) {
  res.on('x-error', (error) => {
    console.log("[error-handler]", 'x-error', new Date());
    if (!res.headersSent) {
      module.exports.internalServerErrorPage(req, res, error);
    }
    else {
      res.end();
    }
    wixCluster.workerShutdown.shutdown();
  });

  res.on('x-timeout', () => {
    console.log("[error-handler]", 'x-timeout', new Date());
    if (!res.headersSent) {
      module.exports.gatewayTimeoutPage(req, res);
    }
    else {
      res.end();
    }
  });

  next();
}

function defaultInternalServerErrorPage(req, res, error) {
  res.status(500).send('Internal Server Error');
}

function defaultGatewayTimeoutPage(req, res) {
  res.status(504).send('Gateway Timeout');
}
