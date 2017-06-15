const axios = require('axios'),
  expect = require('chai').use(require('sinon-chai')).expect,
  rpcClient = require('wix-json-rpc-client'),
  wixHeaders = require('wix-http-headers'),
  testkit = require('wix-http-testkit'),
  rpcTestkit = require('wix-rpc-testkit'),
  makeValidator = require('..'),
  aspects = require('wix-express-aspects'),
  {WixSessionCrypto, devKey} = require('wix-session-crypto'),
  sessionAspect = require('wix-session-aspect'),
  wixExpressErrorHandler = require('wix-express-error-handler'),
  cookieParser = require('cookie-parser'),
  setCookie = require('set-cookie-parser'),
  Logger = require('wnp-debug').Logger,
  sinon = require('sinon');

require('sinon-as-promised');

const _16_MINUTES = 16 * 60 * 1000;
const SERVICE_NAME = 'RemoteRenewalSessionValidationService';
const ENDPOINT = '/validate';

describe('wix-session-renewal', function() {

  this.timeout(10000);

  const {http, rpc, logger, toggler} = setup();
  
  it('succeeds for fresh session', () => {
    toggler.resolves(true);
    const sessionOverrides = {lvld: new Date()};
    const headers = stubRemote({valid: false}, sessionOverrides);
    
    return http.request({headers})
      .then(res => expect(res.status).to.equal(200));
  });
  
  it('fails on validation failure for unvalidated session', () => {
    toggler.resolves(true);
    const sessionOverrides = {lvld: new Date(Date.now() - _16_MINUTES)};
    const headers = stubRemote({valid: false}, sessionOverrides);
    
    return http.request({headers})
      .then(res => {
        expect(res.status).to.equal(401);
        expect(res.data).to.have.property('errorCode', -12);
      });
  });
  
  it('does not perform remote validation when disabled', () => {
    toggler.resolves(false);
    const sessionOverrides = {lvld: new Date(Date.now() - _16_MINUTES)};
    const headers = stubRemote({valid: false}, sessionOverrides);

    return http.request({headers})
      .then(res => expect(res.status).to.equal(200));
  });
  
  it('succeeds on failure to remote call', () => {
    toggler.resolves(true);
    const sessionOverrides = {lvld: new Date(Date.now() - _16_MINUTES)};
    const headers = wixHeaders().withSession(sessionOverrides).headers();

    return http.request({headers})
      .then(res => {
        expect(res.status).to.equal(200);
        expect(logger.error).to.have.been.calledWithMatch(/communication.*failed/i);
      });
  });

  it('succeeds on validation success for unvalidated session with cookies being copied', () => {
    toggler.resolves(true);
    const sessionOverrides = {lvld: new Date(Date.now() - _16_MINUTES)};
    const cookie = {key: 'new-cookie', value: 'cookie-value', httpOnly: true, expirySeconds: 666};
    const headers = stubRemote({valid: true, cookies: [cookie]}, sessionOverrides);
    
    return http.request({headers})
      .then(res => {
        expect(res.status).to.equal(200);
        expectCookie(res, cookie);
      });
  });
  
  it('calls toggler with request', () => {
    toggler.resolves(true);
    const sessionOverrides = {lvld: new Date(Date.now() - _16_MINUTES)};
    const headers = stubRemote({valid: false}, sessionOverrides);

    return http.request({headers})
      .then(() => expect(toggler).to.have.been.calledWithMatch(sinon.match(isRequest)));
  });
  
  function setup() {
    const logger = sinon.createStubInstance(Logger);
    const toggler = sinon.stub();
    
    const rpc = rpcTestkit.server().beforeAndAfter();

    beforeEach(() => {
      rpc.reset();
      toggler.reset();
    });

    const server = testkit.server().beforeAndAfter();

    const remote = rpcClient.factory().clientFactory(rpc.getUrl(), SERVICE_NAME);
    const crypto = new WixSessionCrypto(devKey);
    const validator = makeValidator(remote, crypto, toggler, logger);

    const http = axios.create({
      validateStatus: undefined,
      url: server.getUrl(ENDPOINT),
      headers: {accept: 'application/json'}
    });

    const app = server.getApp();

    app.use(cookieParser());
    app.use(aspects.get([sessionAspect.builder(token => crypto.decrypt(token))]));
    app.get(ENDPOINT, (req, res, next) => {
      validator(req, res)
        .then(() => res.send('ok'))
        .catch(next);
    });
    app.use(wixExpressErrorHandler());
    
    return {rpc, http, logger, toggler};
  }
  
  function expectCookie(res, proto) {
    const cookies = cookiesFrom(res);
    expect(cookies).to.have.lengthOf(1);
    const cookie = cookies[0];
    expect(cookie.name).to.equal(proto.key);
    expect(cookie.value).to.equal(proto.value);
    expect(cookie.httpOnly).to.equal(proto.httpOnly);
    expect(cookie.expires.getTime()).to.be.closeTo(Date.now() + proto.expirySeconds * 1000, 1000);
  }

  function isRequest(something) {
    return !!(something && something.aspects);
  }
  
  function cookiesFrom(res) {
    return setCookie.parse(res.headers['set-cookie']);
  }
  
  function stubRemote(response, sessionOpts) {
    const opts = wixHeaders().withSession(sessionOpts);
    rpc.when(SERVICE_NAME, 'validate').respond(([{session}]) => {
      if (session.userGuid === opts.session().session.userGuid) {
        return response;
      } else {
        throw new Error('unexpected userGuid');
      }
    });
    return opts.headers();
  }
});
