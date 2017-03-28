const gkTestkit = require('wix-gatekeeper-testkit'),
  bootstrapTestkit = require('wix-bootstrap-testkit'),
  fetch = require('node-fetch'),
  reqOptions = require('wix-req-options'),
  configEmitter = require('wix-config-emitter'),
  expect = require('chai').expect,
  {devKey} = require('wix-session-crypto'),
  rpcSupport = require('wix-rpc-client-support'),
  ErrorCode = require('wix-errors').ErrorCode;

describe('gatekeeper bootstrap', function () {
  this.timeout(10000);
  const env = {
    NODE_ENV: 'production',
    APP_CONF_DIR: './target/configs',
    WIX_BOOT_SESSION2_KEY: devKey,
    WIX_BOOT_EXPRESS_SEEN_BY: 'seen-by-env',
    WIX_BOOT_STATSD_HOST: 'localhost',
    WIX_BOOT_RPC_SIGNING_KEY: rpcSupport.devSigningKey,
    WIX_BOOT_SEEN_BY: 'test',
    WIX_BOOT_LABORATORY_URL: 'http://does-not-exist',
    WIX_BOOT_PETRI_URL: 'http://does-not-exist',
  };
  const gkServer = gkTestkit.server({port: 3030}).beforeAndAfter();
  const testApp = bootstrapTestkit.server('./test/app', {env});

  before(() => emitConfig(env).then(() => testApp.start()));
  beforeEach(() => gkServer.reset());
  after(() => testApp.stop());

  const aRequestWithSession = reqOptions.builder().withHeader('accept', 'application/json').withSession();
  const aUserGuid = userGuid(aRequestWithSession);
  const aMetasiteId = 'af4bcfdf-5eee-4b9e-84b8-eef6a6d06d35';
  const aPermission = {scope: 'aScope', action: 'anAction'};

  it('should provide gatekeeper client', () => {

    gkServer.givenUserPermission(aUserGuid, aMetasiteId, aPermission);

    return authorizeAndExpect(testApp, 201);
  });

  it('should provide gatekeeper middleware', () => {

    gkServer.givenUserPermission(aUserGuid, aMetasiteId, aPermission);

    return authorizeWithMiddlewareAndExpect(testApp, 201);
  });

  describe('gatekeeper bootstrap middleware', function () {

    it('should return correct gatekeeper access denied response', () => {
      return expectGatekeeperAccessDeniedResponse(testApp);
    });

  });

  function expectGatekeeperAccessDeniedResponse(app) {
    const url = `/authorizeWithMiddleware?metasite=${aMetasiteId}`;
    return fetchAppUrl(app, url)
      .then(res => {
        expect(res.status).to.equal(401);
        return res.json();
      })
      .then(json => {
        expect(json).to.contain.property('errorCode', ErrorCode.GATEKEEPER_ACCESS_DENIED);
      });
  }

  function authorizeWithMiddlewareAndExpect(app, status) {
    const url = `/authorizeWithMiddleware?metasite=${aMetasiteId}`;
    return fetchAppAndExpect(app, url, status);
  }

  function authorizeAndExpect(app, status) {
    const url = `/authorize?metasite=${aMetasiteId}&scope=${aPermission.scope}&action=${aPermission.action}`;
    return fetchAppAndExpect(app, url, status);
  }

  function fetchAppAndExpect(app, url, status) {
    return fetchAppUrl(app, url)
      .then(res => expect(res.status).to.equal(status));
  }

  function fetchAppUrl(app, url) {
    return fetch(app.getUrl(url), aRequestWithSession.options())
  }

  function userGuid(requestOpts) {
    return requestOpts.wixSession.session.userGuid
  }

  function emitConfig(env) {
    return configEmitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
      .fn('service_url', 'com.wixpress.authorization.gatekeeper.gatekeeper-server', 'http://localhost:3030')
      .emit();
  }
});
