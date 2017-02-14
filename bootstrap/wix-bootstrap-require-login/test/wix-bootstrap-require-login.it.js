const http = require('wix-http-test-client'),
  testkit = require('wix-bootstrap-testkit'),
  reqOptions = require('wix-req-options'),
  sessionCrypto = require('wix-session-crypto'),
  rpcSupport = require('wix-rpc-client-support'),
  emitter = require('wix-config-emitter');

[
  {
    environment: 'config',
    options: {
      env: {
        NODE_ENV: 'production',
        WIX_BOOT_STATSD_HOST: 'localhost',
        WIX_BOOT_RPC_SIGNING_KEY: rpcSupport.devSigningKey,
        WIX_BOOT_SESSION_KEY: sessionCrypto.v1.devKey,
        WIX_BOOT_SESSION2_KEY: sessionCrypto.v2.devKey,
        WIX_BOOT_SEEN_BY: 'seen-by-env',
        WIX_BOOT_LABORATORY_URL: 'http://non-existent'
      }
    },
    redirectBaseUrl: 'https://users.localhost/signin'
  },
  {
    environment: 'env',
    options: { env: { WIX_BOOT_LOGIN_URL: 'http://localhost/signin' } },
    redirectBaseUrl: 'http://localhost/signin'
  },
  {
    environment: 'development',
    options: { env: { NODE_ENV: 'development' } },
    redirectBaseUrl: 'http://require_login_redirect_url/'
  }
].forEach(testCase => {
  const environment = testCase.environment;
  const appOptions = testCase.options;
  const redirectBaseUrl = testCase.redirectBaseUrl;

  describe(`Require login in ${environment} run mode`, function () {
    this.timeout(10000);
    const requestWithSessionOpts = reqOptions.builder().withSession().options();
    const app = testkit.server('./test/app/test-app-launcher', appOptions);

    before(() => emitConfigWithPort().then(() => app.start()));

    after(() => app.stop());

    describe('With forbid', () => {
      const resourceThatForbids = '/required-login-with-forbid-resource';

      it('Receives 401 when not authenticated', () => {
        const resourceUrl = app.getUrl(resourceThatForbids);
        return http.get(resourceUrl).verify({ status: 401 });
      });

      it('Receives 200 when authenticated', () => {
        const resourceUrl = app.getUrl(resourceThatForbids);
        return http.get(resourceUrl, requestWithSessionOpts).verify({ status: 200 });
      });
    });

    describe('With redirect', () => {
      const resourceThatRedirects = '/required-login-with-redirect-resource';

      it('Redirects to a URL with return params when not authenticated', () => {
        const resourceUrl = app.getUrl(resourceThatRedirects);
        const encodedReturnUrl = encodeURIComponent(resourceUrl);
        const redirectUrl = `${redirectBaseUrl}?postLogin=${encodedReturnUrl}&postSignUp=${encodedReturnUrl}`;
        return http.get(resourceUrl, {
          redirect: 'manual',
        }).verify(redirectsTo(redirectUrl));
      });

      it('Receives 200 when authenticated', () => {
        const resourceUrl = app.getUrl(resourceThatRedirects);
        return http.get(resourceUrl, requestWithSessionOpts).verify({ status: 200 });
      });
    });

    function emitConfigWithPort() {
      return emitter({ sourceFolders: ['./templates'], targetFolder: './target/configs' })
        .fn('base_domain', 'localhost')
        .emit();
    }

    function redirectsTo(location) {
      return {
        status: 302,
        headers: { Location: location }
      }
    }
  });
});
