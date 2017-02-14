const { requireLogin, forbid, redirect } = require('wix-express-require-login'),
  runMode = require('wix-run-mode'),
  log = require('wnp-debug')('wix-bootstrap-require-login');

const configName = 'wix-bootstrap-require-login';

module.exports.di = {
  key: 'requireLogin',
  value: requireLoginFactory
};

function requireLoginFactory(context) {
  function makeRedirectUrl(baseUrl, returnUrl) {
    return `${baseUrl}?postLogin=${encodeURIComponent(returnUrl)}&postSignUp=${encodeURIComponent(returnUrl)}`;
  }

  function resolveBaseUrlFromConfig() {
    if (runMode.isProduction()) {
      return context.config.load(configName).endpoints.loginUrl;
    } else {
      log.debug('In non-production mode, please export WIX_BOOT_LOGIN_URL environment variable to provide a requireLogin redirect URL')
      return 'http://require_login_redirect_url';
    }
  }

  const baseUrl = context.env.WIX_BOOT_LOGIN_URL || resolveBaseUrlFromConfig();

  return {
    forbid: requireLogin(forbid),
    redirect: requireLogin(redirect((req) => {
      const forwardedUrl = req.aspects['web-context'].url;
      return makeRedirectUrl(baseUrl, forwardedUrl);
    }))
  };
}
