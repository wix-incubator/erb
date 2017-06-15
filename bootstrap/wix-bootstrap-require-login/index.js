const WixExpressRequireLogin = require('wix-express-require-login'),
  runMode = require('wix-run-mode'),
  ofacValidation = require('./lib/ofac-validation'),
  remoteValidation = require('./lib/remote-validation'),
  log = require('wnp-debug')('wix-bootstrap-require-login');

const configName = 'wix-bootstrap-require-login';

module.exports.di = {
  key: 'requireLogin',
  value: requireLogin
};

function requireLogin(context) {
  
  function makeRedirectUrl(baseUrl, returnUrl, languageCode) {
    const encodedReturnUrl = encodeURIComponent(returnUrl); 
    return `${baseUrl}?originUrl=${encodedReturnUrl}&redirectTo=${encodedReturnUrl}&overrideLocale=${languageCode}`;
  }

  function resolveBaseUrlFromConfig() {
    if (runMode.isProduction()) {
      return context.config.load(configName).loginUrl;
    } else {
      log.debug('In non-production mode, please export WIX_BOOT_LOGIN_URL environment variable to provide a requireLogin redirect URL');
      return 'http://require_login_redirect_url';
    }
  }
  
  const baseUrl = context.env.WIX_BOOT_LOGIN_URL || resolveBaseUrlFromConfig();

  function defaultRedirect(req) {
    const forwardedUrl = req.aspects['web-context'].url;
    const languageCode = req.aspects['web-context'].language;
    return makeRedirectUrl(baseUrl, forwardedUrl, languageCode);
  }
  
  const validation = andThen(ofacValidation, remoteValidation(context));
  
  const requireLogin = new WixExpressRequireLogin(defaultRedirect, validation); 

  return {
    forbid: () => requireLogin.forbid(),
    redirect: url => requireLogin.redirect(url)
  };
}

function andThen(fn1, fn2) {
  return (req, res) => fn1(req, res).then(() => fn2(req, res));
}
