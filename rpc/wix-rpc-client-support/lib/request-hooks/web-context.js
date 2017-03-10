const log = require('wnp-debug')('wix-rpc-client-support');

module.exports.get = () => (headers, body, context) => {
  const webContext = context && context['web-context'];

  if (!webContext) {
    log.error('web-context aspect not provided.');
    return;
  }

  setIfAny(webContext.requestId, val => headers['X-Wix-Request-Id'] = val);
  setIfAny(webContext.userPort, val => headers['X-WIX-DEFAULT_PORT'] = val);
  setIfAny(webContext.userAgent, val => headers['user-agent'] = val);
  setIfAny(webContext.userIp, val => headers['X-WIX-IP'] = val);
  setIfAny(webContext.url, val => headers['X-Wix-Forwarded-Url'] = val);
  setIfAny(webContext.language, val => headers['X-Wix-Language'] = val);
  if (webContext.geo) {
    setIfAny(webContext.geo['2lettersCountryCode'], val => headers['X-Wix-Country-Code'] = val);
  }
};

function setIfAny(what, fn) {
  if (what) {
    fn(what);
  }
}
