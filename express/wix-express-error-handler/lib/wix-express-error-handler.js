const {HttpStatus, ErrorCode} = require('wix-errors');

module.exports = () => {
  return function wixExpressErrorHandler(err, req, res, next) {
    if (!res.headersSent) {
      const status = err.httpStatusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      res.status(status);
      if (isJson(req)) {
        handleAjaxError(err, req, res);
      } else {
        res.send(HttpStatus.getStatusText(status));
      }
    } else {
      res.end();
    }
    next();
  };
};

function handleAjaxError(err, req, res) {
  let errorCode = err.errorCode || ErrorCode.UNKNOWN;
  if (err._exposeMessage) {
    res.json({message: err.message, errorCode: errorCode});
  } else {
    let message = 'Internal Server Error';
    if (req.aspects && req.aspects['web-context'] && req.aspects['web-context'].requestId) {
      message = `Internal Server Error [request-id: ${req.aspects['web-context'].requestId}]`
    }
    res.json({message, errorCode});
  }
}

function isJson(req) {
  const accept = req.get('Accept');
  return accept && accept.toLowerCase().indexOf('json') > -1;
}
