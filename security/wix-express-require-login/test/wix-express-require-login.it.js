const http = require('wix-http-test-client'),
  testkit = require('wix-http-testkit'),
  reqOptions = require('wix-req-options'),
  wixSessionAspect = require('wix-session-aspect'),
  wixExpressAspects = require('wix-express-aspects'),
  {WixSessionCrypto, devKey} = require('wix-session-crypto'),
  expect = require('chai').use(require('sinon-chai')).expect,
  WixExpressRequireLogin = require('..'),
  {ErrorCode} = require('wix-errors'),
  wixExpressErrorHandler = require('wix-express-error-handler'),
  cookieParser = require('cookie-parser'),
  sinon = require('sinon'),
  wixErrors = require('wix-errors');

require('sinon-as-promised');

describe('wix-express-require-login', () => {

  const requestWithSessionOpts = reqOptions.builder().withSession().withHeader('accept', 'application/json').options();
  const server = testkit.server();
  const validation = sinon.stub();
  
  beforeEach(() => validation.reset());

  setupAppServer();

  describe('forbid', function () {
    
    const url = server.getUrl('/forbid');

    it('responds with 401 when not authenticated', function () {
      return http.get(url, {headers: {'accept': 'application/json'}})
        .verify({
          status: 401,
          json: json => expect(json).to.have.property('errorCode', ErrorCode.SESSION_REQUIRED)
        });
    });

    it('responds with 200 when authenticated and validation passes', function () {
      validation.resolves('ok');
      return http.get(url, requestWithSessionOpts).verify({status: 200});
    });
    
    it('fails the request upon failed validation', () => {
      validation.rejects(new SessionValidationError());
      return http.get(url, requestWithSessionOpts)
        .verify({
          status: wixErrors.HttpStatus.UNSUPPORTED_MEDIA_TYPE,
          json: json => expect(json).to.have.property('errorCode', 666)
        });
    });
    
    it('passes request and response instances to validation function', () => {
      validation.resolves('ok');
      return http.get(url, requestWithSessionOpts)
        .then(() => expect(validation).to.have.been.calledWithMatch(sinon.match(isRequest), sinon.match(isResponse)));
    });
  });

  describe('redirect', function () {
    
    describe('with default URL resolver', () => {
      
      const url = server.getUrl('/default-redirect');
      
      it('redirects to URL calculated by default resolver when no session', function () {
        return http.get(url, {redirect: 'manual'}).verify({
          status: 302,
          headers: {Location: 'http://default-redirect/'}
        });
      });

      it('redirects to a predefined URL when session validation fails', function () {
        validation.rejects(new SessionValidationError());
        return http.get(url, {redirect: 'manual'}).verify({
          status: 302,
          headers: {Location: 'http://default-redirect/'}
        });
      });

      it('responds with 200 when authenticated', function () {
        validation.resolves('ok');
        return http.get(url, requestWithSessionOpts).verify({status: 200});
      });
    });
    
    it('supports string redirect URL', () => {
      return http.get(server.getUrl('/string-redirect'), {redirect: 'manual'}).verify({
        status: 302,
        headers: {Location: 'http://string-redirect/'}
      });
    });

    it('supports function redirect URL', () => {
      return http.get(server.getUrl('/function-redirect?q=42'), {redirect: 'manual'}).verify({
        status: 302,
        headers: {Location: 'http://function-redirect/42'}
      });
    });
  });

  function setupAppServer() {
    const app = server.beforeAndAfter().getApp();
    
    const requireLogin = new WixExpressRequireLogin(() => 'http://default-redirect', validation);

    app.use(cookieParser());
    app.use(wixExpressAspects.get([wixSessionAspect.builder(token => new WixSessionCrypto(devKey).decrypt(token))]));

    app.get('/forbid', requireLogin.forbid(), (req, res) => {
      res.sendStatus(200);
    });

    app.get('/default-redirect', requireLogin.redirect(), (req, res) => {
      res.sendStatus(200);
    });

    app.get('/string-redirect', requireLogin.redirect('http://string-redirect/'), (req, res) => {
      res.sendStatus(200);
    });

    app.get('/function-redirect', requireLogin.redirect(req => 'http://function-redirect/' + req.query.q), (req, res) => {
      res.sendStatus(200);
    });

    app.use(wixExpressErrorHandler());
  }
  
  function isRequest(something) {
    return !!(something && something.aspects);
  }
  
  function isResponse(something) {
    return !!(something && something.send);
  }
  
  class SessionValidationError extends wixErrors.wixSystemError(666, wixErrors.HttpStatus.UNSUPPORTED_MEDIA_TYPE) {
    
    constructor() {
      super('invalid session')
    }
  }
});
