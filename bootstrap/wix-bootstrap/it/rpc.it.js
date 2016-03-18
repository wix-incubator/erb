'use strict';
const chance = require('chance')(),
  expect = require('chai').expect,
  reqOptions = require('wix-req-options'),
  env = require('./support/environment'),
  cookieUtils = require('cookie-utils'),
  req = require('./support/req'),
  sessionTestkit = require('wix-session-crypto-testkit');

describe('wix-bootstrap rpc', function () {
  this.timeout(60000);
  env.start();

  let opts;
  beforeEach(() => opts = reqOptions.builder().withBi().withSession());

  describe('client', () => {

    it('should provide pre-configured rpc client', () => {
      const uuid = chance.guid();
      return aGet(`/rpc/hello/${uuid}`).then(res =>
        expect(res.json()).to.deep.equal({
          id: uuid,
          name: 'John',
          email: 'doe@wix.com'
        }));
    });

    it('should allow usage of rpc client by detaching from parent object', () => {
      const uuid = chance.guid();
      return aGet(`/rpc/hello-detached/${uuid}`)
        .then(res => expect(res.json()).to.deep.equal({
          id: uuid,
          name: 'John',
          email: 'doe@wix.com'
        }));
    });

    it('should verify that client is called with aspects as a first argument', () => {
      return req.get(env.appUrl('/rpc/without-aspects'), opts.options()).then(res => {
        expect(res.status).to.equal(500);
        return res.json();
      }).then(json => expect(json).to.contain.property('message', 'client must be called with `req.aspects` as a first argument'));
    });
  });

  it('should get request context from remote rpc', () => {
    const req = opts.options();

    return aGet('/rpc/req-context', opts).then(res => {
      const webContext = res.json();
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
      expect(res.headers.get('x-seen-by')).to.equal('seen-by-Villus,rpc-jvm17.wixpress.co.il')
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

  it('should respect preconfigured timeout (in index.js)', () =>
    req.get(env.appUrl('/rpc/timeout/1000')).then(res => {
      expect(res.status).to.equal(500);
      expect(res.json()).to.deep.equal({
        name: "RpcRequestError",
        message: "network timeout at: http://localhost:3310/NonFunctional"
      });
    })
  );

  it('should return rpc caller id from remote server', () =>
    aGet('/rpc/caller-id').then(res =>
      expect(res.json()).to.deep.equal({artifactId: 'wix-bootstrap', host: 'test-host.aus'})
    )
  );

  function aGet(path, options) {
    return req.get(env.appUrl(path), options || opts.options()).then(res => {
      expect(res.status).to.equal(200);
      return res;
    });
  }

  function extractCookies(res) {
    return cookieUtils.fromHeader(res.headers.get('set-cookie'));
  }
});