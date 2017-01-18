module.exports = () => {
  return function wixExpressErrorHandler(err, req, res, next) {
    if (!res.headersSent) {
      if (isTimeoutError(err)) {
        gatewayTimeoutPage(req, res, err);
      } else {
        internalServerErrorPage(req, res, err);
      }
    }
    else {
      res.end();
    }
    next();
  };
};

function internalServerErrorPage(req, res, error) {
  if (isJson(req)) {
    res.status(500).json({code: error.code, name: error.name, message: error.message});
  } else {
    res.status(500).send('Internal Server Error');
  }
}

function gatewayTimeoutPage(req, res, error) {
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

function isTimeoutError(err) {
  return err._timeout && err._timeout === true;
}
