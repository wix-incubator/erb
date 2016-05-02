'use strict';
const expect = require('chai').expect,
  reqOptions = require('wix-req-options'),
  cookieUtils = require('cookie-utils'),
  sessionTestkit = require('wix-session-crypto-testkit'),
  testkit = require('wnp-composer-testkit'),
  http = require('wnp-http-test-client'),
  jvmTestkit = require('wix-jvm-bootstrap-testkit');

describe('wix bootstrap rpc', function () {
  this.timeout(60000);
  const env = {RPC_SERVER_PORT: 3310, RPC_TIMEOUT: 700};
  let opts;
  beforeEach(() => opts = reqOptions.builder().withBi().withSession());

  const app = testkit.server('./test/app', {env});
  const rpcServer = jvmTestkit.server({
    artifact: {
      groupId: 'com.wixpress.node',
      artifactId: 'wix-rpc-server',
      version: '1.0.0-SNAPSHOT'
    },
    port: env.RPC_SERVER_PORT
  });

  before(() => rpcServer.start().then(() => app.start()));
  after(() => app.stop().then(() => rpcServer.stop()));

  it('should get request context from remote rpc', () => {
    const req = opts.options();

    return http.okGet(app.getUrl('/rpc/req-context'), opts).then(res => {
      const webContext = res.json();
      expect(webContext.requestId).to.equal(req.headers['x-wix-request-id']);
      expect(webContext.userAgent).to.be.defined;
      expect(webContext.remoteIp).to.be.defined;
      expect(webContext.url).to.be.defined;
    });
  });

  it('should forward wix-session onto rpc request', () =>
    http.okGet(app.getUrl('/rpc/wix-session'), opts.options())
      .then(res => expect(res.text()).to.equal(opts.wixSession.sessionJson.userGuid))
  );

  it('should inject x-seen-by into rpc request', () =>
    http.okGet(app.getUrl('/rpc/req-context'))
      .then(res => expect(res.headers.get('x-seen-by')).to.equal('seen-by-dev,rpc-jvm17.wixpress.co.il')
      )
  );

  it('should inject petri cookies returned from rpc request into aspects', () =>
    http.okGet(app.getUrl('/rpc/petri/experiment/spec1'))
      .then(extractCookies)
      .then(cookies => expect(cookies).to.have.property('_wixAB3', '1#1'))
  );

  it('should add petri cookies to response merged with ones returned from rpc', () =>
    http.okGet(app.getUrl('/rpc/petri/clear'))
      .then(() => http.okGet(app.getUrl('/rpc/petri/experiment/spec1')))
      .then(() => http.okGet(app.getUrl('/rpc/petri/experiment/spec2'), reqOptions.builder().withPetriAnonymous(1, 1).options()))
      .then(res => extractCookies(res))
      .then(cookies => expect(cookies).to.contain.property('_wixAB3', '1#1|2#1'))
  );

  it('should add authenticated petri cookies to response merged with ones returned from rpc', () => {
    const session = sessionTestkit.aValidBundle();
    const userGuid = session.session.userGuid;
    const opts = reqOptions.builder().withSession({
      mainKey: session.mainKey,
      session: session.session
    });
    return http.okGet(app.getUrl('/rpc/petri/clear'))
      .then(() => http.okGet(app.getUrl('/rpc/petri/auth-experiment/spec1'), opts.options()))
      .then(() => http.okGet(app.getUrl('/rpc/petri/auth-experiment/spec2'), opts.withPetri(userGuid, 1, 1).options()))
      .then(res => extractCookies(res))
      .then(cookies => expect(cookies).to.contain.property(`_wixAB3|${userGuid}`, '1#1|2#1'))
  });

  it('should respect preconfigured timeout', () =>
    http(app.getUrl('/rpc/timeout/1000'), http.accept.json)
      .then(res => {
        expect(res.status).to.equal(500);
        expect(res.json()).to.deep.equal({
          name: 'RpcRequestError',
          message: 'network timeout at: http://localhost:3310/NonFunctional'
        });
      })
  );

  it('should return rpc caller id from remote server', () =>
    http.okGet(app.getUrl('/rpc/caller-id'))
      .then(res => {
        console.log(res.json());
        expect(res.json()).to.deep.equal({artifactId: 'wix-bootstrap-rpc', host: 'test-host'});
      })
  );

  function extractCookies(res) {
    return cookieUtils.fromHeader(res.headers.get('set-cookie'));
  }
});