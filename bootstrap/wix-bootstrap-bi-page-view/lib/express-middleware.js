const _ = require('lodash'),
  storage = require('./storage');

module.exports = (req, res, next) => {
  storage(res).eventId = setupCookiesAndResolveEventId(req, res); 
  next();
};

function setupCookiesAndResolveEventId(req, res) {
  const cookies = storage(res).cookies = {};
  const biAspect = req.aspects['bi'];

  let eventId = 1001;

  if (!biAspect.clientId || biAspect.clientId === biAspect.visitorId) {
    _.set(cookies, '_wixCIDX', biAspect.generateClientId());
    eventId = 1000;
  }

  if (!biAspect.globalSessionId) {
    _.set(cookies, '_wix_browser_sess', biAspect.generateGlobalSessionId());
  }

  if (!biAspect.userId) {
    _.set(cookies, '_wixUIDX', 'null-user-id');
  }

  return eventId;
}

