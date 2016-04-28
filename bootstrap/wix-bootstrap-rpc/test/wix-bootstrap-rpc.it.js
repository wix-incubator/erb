'use strict';
const fetch = require('node-fetch'),
  expect = require('chai').expect,
  reqOptions = require('wix-req-options'),
  cookieUtils = require('cookie-utils'),
  sessionTestkit = require('wix-session-crypto-testkit'),
  envSupport = require('env-support'),
  testkit = require('wix-childprocess-testkit'),
  jvmTestkit = require('wix-jvm-bootstrap-testkit');

describe('wix bootstrap rpc', function () {
  this.timeout(60000);
  const env = envSupport.bootstrap({RPC_SERVER_PORT: 3310, RPC_TIMEOUT: 700});
  let opts;
  beforeEach(() => opts = reqOptions.builder().withBi().withSession());

  const app = testkit.server('./test/app', {env: env}, testkit.checks.httpGet('/health/is_alive'));
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

    return aJsonGet('/rpc/req-context', opts).then(res => {
      const webContext = res.json;
      expect(webContext.requestId).to.equal(req.headers['x-wix-request-id']);
      expect(webContext.userAgent).to.be.defined;
      expect(webContext.remoteIp).to.be.defined;
      expect(webContext.url).to.be.defined;
    });
  });

  it('should forward wix-session onto rpc request', () =>
    aGet('/rpc/wix-session').then(res =>
      expect(res.text).to.equal(opts.wixSession.sessionJson.userGuid))
  );

  it('should inject x-seen-by into rpc request', () =>
    aGet('/rpc/wix-session').then(res =>
      expect(res.headers.get('x-seen-by')).to.equal('seen-by-dev,rpc-jvm17.wixpress.co.il')
    )
  );

  it('should inject petri cookies returned from rpc request into aspects', () =>
    aGet('/rpc/petri/experiment/spec1')
      .then(extractCookies)
      .then(cookies => expect(cookies).to.have.property('_wixAB3', '1#1'))
  );

  it('should add petri cookies to response merged with ones returned from rpc', () =>
    aGet('/rpc/petri/clear')
      .then(() => aGet('/rpc/petri/experiment/spec1'))
      .then(() => aGet('/rpc/petri/experiment/spec2', reqOptions.builder().withPetriAnonymous(1, 1).options()))
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
    return aGet('/rpc/petri/clear')
      .then(() => aGet('/rpc/petri/auth-experiment/spec1', opts.options()))
      .then(() => aGet('/rpc/petri/auth-experiment/spec2', opts.withPetri(userGuid, 1, 1).options()))
      .then(res => extractCookies(res))
      .then(cookies => expect(cookies).to.contain.property(`_wixAB3|${userGuid}`, '1#1|2#1'))
  });

  it('should respect preconfigured timeout', () =>
    fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/rpc/timeout/1000`, {headers: {'accept': 'application/json'}})
      .then(res => {
        expect(res.status).to.equal(500);
        return res.json();
      })
      .then(json => {
        expect(json).to.deep.equal({
          name: 'RpcRequestError',
          message: 'network timeout at: http://localhost:3310/NonFunctional'
        });
      })
  );

  it('should return rpc caller id from remote server', () =>
    aJsonGet('/rpc/caller-id').then(res =>
      expect(res.json).to.deep.equal({artifactId: 'wix-bootstrap-rpc', host: 'test-host.aus'})
    )
  );

  function aJsonGet(path, options) {
    return fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}${path}`, options || opts.options())
      .then(res => {
        expect(res.status).to.equal(200);
        return res.json().then(json => {
          res.json = json;
          return res;
        });
      });
  }

  function aGet(path, options) {
    return fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}${path}`, options || opts.options())
      .then(res => {
        expect(res.status).to.equal(200);
        return res.text().then(text => {
          res.text = text;
          return res;
        });
      });
  }

  function extractCookies(res) {
    return cookieUtils.fromHeader(res.headers.get('set-cookie'));
  }
});