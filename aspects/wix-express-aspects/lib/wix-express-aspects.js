const wixAspects = require('wix-aspects'),
  logger = require('wnp-debug')('wix-express-aspects'),
  {format} = require('util');

module.exports.get = function wixExpressAspects(aspectBuilders, log = logger) {

  return function wixExpressAspects(req, res, next) {
    const reqData = buildReqObject(req);
    req.aspects = {};

    try {
      const store = wixAspects.buildStore(reqData, aspectBuilders);
      req.aspects = store;

      res.on('x-before-flushing-headers', () => {
        Object.keys(store).forEach(key => writeToResponse(store[key].export(), res));
      });
    } catch(e) {
      log.error(format('Failed building aspect store with data: %j, error: %s, stack: %s', reqData, e, e.stack));
    }

    next();
  };
};

function buildReqObject(req) {
  return {
    headers: req.headers,
    cookies: req.cookies,
    query: req.query,
    url: `${req.protocol}://${req.headers['host']}${req.originalUrl}`,
    originalUrl: req.originalUrl,
    remoteAddress: req.ip ||  req.connection.remoteAddress,
    remotePort: req.connection.remotePort
  };
}

function writeToResponse(resObject, res) {
  if (resObject && resObject.headers) {
    res.set(resObject.headers);
  }

  if (resObject && resObject.cookies) {
    resObject.cookies.forEach(cookie => res.cookie(cookie.key, cookie.value, cookie.properties));
  }
}
