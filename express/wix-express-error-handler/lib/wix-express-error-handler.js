const {HttpStatus, ErrorCode} = require('wix-errors'),
  logger = require('wnp-debug');

const defaultRenderErrorPage = (req, status) => `Http Error: ${status}`;

module.exports = (renderErrorPage = defaultRenderErrorPage, log = logger('wix-express-error-handler')) => {
  const render = safeRenderErrorPage(renderErrorPage, defaultRenderErrorPage, log);
  
  return function wixExpressErrorHandler(err, req, res, next) {
    if (!res.headersSent) {
      const status = err.httpStatusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      res.status(status);
      if (isJson(req)) {
        handleAjaxError(err, req, res);
      } else {
        const errorCode = getErrorCode(err);
        res.send(render(req, status, errorCode));
      }
    } else {
      res.end();
    }
    next();
  };
};

function handleAjaxError(err, req, res) {
  let errorCode = getErrorCode(err);
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

function getErrorCode(error) {
  return error.errorCode || ErrorCode.UNKNOWN;
}

function safeRenderErrorPage(render, renderFallback, log) {
  return (req, status, errorCode) => {
    try {
      return render(req, status, errorCode);
    } catch (e) {
      log.error('Error occurred with rendering', e);
      return renderFallback(req, status);
    }
  }
}
