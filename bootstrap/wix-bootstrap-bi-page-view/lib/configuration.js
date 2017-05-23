const defaultLog = require('wnp-debug')('wix-bootstrap-bi-page-view');

module.exports.load = ({env, config, log = defaultLog}) => {
  let cookieDomain;
  
  if (env && env.COOKIE_DOMAIN) {
    cookieDomain = env.COOKIE_DOMAIN;
    log.debug(`cookie domain [${cookieDomain}] is taken from env override`);
  } else if (env && env.NODE_ENV === 'production') {
    cookieDomain = config.load('wix-bootstrap-bi-page-view-config').cookieDomain;
  } else {
    cookieDomain = '.wix.com';
    log.debug(`cookie domain [${cookieDomain}] as default`);
  }
  
  return cookieDomain;
};
