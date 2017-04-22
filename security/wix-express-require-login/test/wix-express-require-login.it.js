const http = require('wix-http-test-client'),
  testkit = require('wix-http-testkit'),
  reqOptions = require('wix-req-options'),
  wixSessionAspect = require('wix-session-aspect'),
  wixExpressAspects = require('wix-express-aspects'),
  {WixSessionCrypto, devKey} = require('wix-session-crypto'),
  expect = require('chai').expect,
  {requireLogin, forbid, redirect} = require('..'),
  {ErrorCode} = require('wix-errors'),
  wixExpressErrorHandler = require('wix-express-error-handler'),
  cookieParser = require('cookie-parser');

describe('Require login', () => {

  const redirectUrl = 'http://nonexistenturl/';
  const requestWithSessionOpts = reqOptions.builder().withSession().options();
  const server = testkit.server();

  setupAppServer();

  describe('With forbid', function () {
    const forbidPath = 'required-login-with-forbid-resource';
    const resourceUrl = server.getUrl(forbidPath);

    it('Responds with 401 when not authenticated', function () {
      return http.get(resourceUrl, {headers: {'accept': 'application/json'}})
        .verify({
          status: 401,
          json: json => expect(json).to.have.property('errorCode', ErrorCode.SESSION_REQUIRED)
        });
    });

    it('Responds with 200 when authenticated', function () {
      return http.get(resourceUrl, requestWithSessionOpts).verify({status: 200});
    });
  });

  describe('With redirect', function () {
    const redirectPath = '/required-login-with-redirect-resource';
    const resourceUrl = server.getUrl(redirectPath);

    it('Redirects to a predefined URL when not authenticated', function () {
      return http.get(resourceUrl, {redirect: 'manual'}).verify({
        status: 302,
        headers: {Location: redirectUrl}
      });
    });

    it('Responds with 200 when authenticated', function () {
      return http.get(resourceUrl, requestWithSessionOpts).verify({status: 200});
    });
  });


  function setupAppServer() {
    const app = server.beforeAndAfter().getApp();
    const forbidUnauthenticated = requireLogin(forbid);
    const redirectUnauthenticated = requireLogin(redirect(returnUrlAndExpectRequestToBePassed));
    
    app.use(cookieParser());
    app.use(wixExpressAspects.get([wixSessionAspect.builder(token => new WixSessionCrypto(devKey).decrypt(token))]));

    app.get('/required-login-with-forbid-resource', forbidUnauthenticated, (req, res) => {
      res.sendStatus(200);
    });

    app.get('/required-login-with-redirect-resource', redirectUnauthenticated, (req, res) => {
      res.sendStatus(200);
    });

    app.use(wixExpressErrorHandler());

    function returnUrlAndExpectRequestToBePassed(req) {
      expect(req.method).to.exist;
      return redirectUrl;
    }
  }
});
