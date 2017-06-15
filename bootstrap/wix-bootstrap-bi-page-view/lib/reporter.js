const browserLanguage = require('./resolvers/browser-language'),
  referer = require('./resolvers/referer'),
  _ = require('lodash'),
  storage = require('./storage'),
  defaultLog = require('wnp-debug')('wix-bootstrap-bi-page-view');

const THREE_MONTHS_IN_MILLIS = 3 * 30 * 24 * 60 * 60 * 1000;

module.exports = (biLoggerFactory, cookieDomain, log = defaultLog) => {

  return (req, res) => {
    const {eventId, cookies} = storage(res); 
    
    if (eventId && cookies) {
      _.forOwn(cookies, addCookie(res));

      return reportEvent(req, eventId);
    } else {
      log.error('Cannot report page view event due to misconfiguration. ' +
        'Did you forget you install the express middleware? See documentation for details.');
      return Promise.resolve({});
    }
  };

  function reportEvent(req, eventId) {
    const biLogger = biLoggerFactory.logger(req.aspects);
    return biLogger.log({
      evid: eventId,
      src: 19,
      browser_language: browserLanguage(req.headers['accept-language']),
      referrer: referer(req.headers['referer']),
      http_referrer: req.aspects['web-context'].url
    })
  }

  function addCookie(res) {
    return (value, name) => {
      res.cookie(name, value, {maxAge: THREE_MONTHS_IN_MILLIS, domain: cookieDomain});
    }
  }
};

