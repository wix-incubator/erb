const http = require('wix-http-test-client'),
  testkit = require('wix-http-testkit'),
  reqOptions = require('wix-req-options'),
  wixSessionAspect = require('wix-session-aspect'),
  wixExpressAspects = require('wix-express-aspects'),
  wixSessionCrypto = require('wix-session-crypto'),
  expect = require('chai').expect,
  {requireLogin, forbid, redirect} = require('..');

describe('Require login', () => {

  const redirectUrl = 'http://nonexistenturl/';
  const requestWithSessionOpts = reqOptions.builder().withSession().options();
  const server = testkit.server();

  setupAppServer();

  describe('With forbid', function () {
    const forbidPath = 'required-login-with-forbid-resource';
    const resourceUrl = server.getUrl(forbidPath);

    it('Responds with 401 when not authenticated', function () {
      return http.get(resourceUrl).verify({ status: 401 });
    });

    it('Responds with 200 when authenticated', function () {
      return http.get(resourceUrl, requestWithSessionOpts).verify({ status: 200 });
    });
  });

  describe('With redirect', function () {
    const redirectPath = '/required-login-with-redirect-resource';
    const resourceUrl = server.getUrl(redirectPath);

    it('Redirects to a predefined URL when not authenticated', function () {
      return http.get(resourceUrl, { redirect: 'manual' }).verify({
        status: 302,
        headers: { Location: redirectUrl }
      });
    });

    it('Responds with 200 when authenticated', function () {
      return http.get(resourceUrl, requestWithSessionOpts).verify({ status: 200 });
    });
  });


  function setupAppServer() {
    const app = server.beforeAndAfter().getApp();
    const forbidUnauthenticated = requireLogin(forbid);
    const redirectUnauthenticated = requireLogin(redirect(returnUrlAndExpectRequestToBePassed));

    app.use(wixExpressAspects.get([
      wixSessionAspect.builder(
        token => wixSessionCrypto.v1.get(wixSessionCrypto.v1.devKey).decrypt(token),
        token => wixSessionCrypto.v2.get(wixSessionCrypto.v2.devKey).decrypt(token)
      )]
    ));

    app.get('/required-login-with-forbid-resource', forbidUnauthenticated, (req, res) => {
      res.sendStatus(200);
    });

    app.get('/required-login-with-redirect-resource', redirectUnauthenticated, (req, res) => {
      res.sendStatus(200);
    });

    function returnUrlAndExpectRequestToBePassed(req) {
      expect(req.method).to.exist;
      return redirectUrl;
    }
  }
});
