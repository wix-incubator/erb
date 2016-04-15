'use strict';
module.exports.handler = shutdown => handlerMiddleware(shutdown);
module.exports.internalServerErrorPage = defaultInternalServerErrorPage;
module.exports.gatewayTimeoutPage = defaultGatewayTimeoutPage;

function handlerMiddleware(shutdown) {
  const die = shutdown || killMe;

  return function wixExpressErrorHandler(req, res, next) {
    res.on('x-error', error => {
      setImmediate(() => {
        if (!res.headersSent) {
          module.exports.internalServerErrorPage(req, res, error);
        }
        else {
          res.end();
        }

        if (!keepWorkerRunning(error)) {
          die();
        }
      });
    });

    res.on('x-timeout', error => {
      setImmediate(() => {
        if (!res.headersSent) {
          module.exports.gatewayTimeoutPage(req, res, error);
        }
        else {
          res.end();
        }
      });
    });

    next();
  };
}

function defaultInternalServerErrorPage(req, res, error) {
  if (isJson(req)) {
    res.status(500).json({code: error.code, name: error.name, message: error.message});
  } else {
    res.status(500).send('Internal Server Error');
  }
}

function defaultGatewayTimeoutPage(req, res, error) {
  if (isJson(req)) {
    res.status(504).json({name: error.name, message: error.message});
  } else {
    res.status(504).send('Gateway Timeout');
  }
}

function isJson(req) {
  const accept = req.get('Accept');
  return accept && accept.toLowerCase().indexOf('json') > -1;
}

function keepWorkerRunning(error) {
  return error.applicative && error.applicative === true;
}

function killMe() {
  process.exit(0);
}