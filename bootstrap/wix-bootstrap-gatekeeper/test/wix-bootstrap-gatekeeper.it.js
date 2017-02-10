const gkTestkit = require('wix-gatekeeper-testkit'),
  bootstrapTestkit = require('wix-bootstrap-testkit'),
  fetch = require('node-fetch'),
  reqOptions = require('wix-req-options'),
  configEmitter = require('wix-config-emitter'),
  expect = require('chai').expect,
  sessionCrypto = require('wix-session-crypto'),
  rpcSupport = require('wix-rpc-client-support');

describe('gatekeeper bootstrap', function () {
  this.timeout(10000);

  before(() =>
    configEmitter({sourceFolders: ['./templates'], targetFolder: './target/configs'})
      .fn('service_url', 'com.wixpress.authorization.gatekeeper.gatekeeper-server', 'http://localhost:3030')
      .emit()
  );

  const gkServer = gkTestkit.server({port: 3030}).beforeAndAfter();
  const testApp = bootstrapTestkit.server('./test/testapp', {env: {
    NODE_ENV: 'production', 
    APP_CONF_DIR: './target/configs',
    WIX_BOOT_SESSION_KEY: sessionCrypto.v1.devKey,
    WIX_BOOT_SESSION2_KEY: sessionCrypto.v2.devKey,
    WIX_BOOT_EXPRESS_SEEN_BY: 'seen-by-env',
    WIX_BOOT_STATSD_HOST: 'localhost',
    WIX_BOOT_RPC_SIGNING_KEY: rpcSupport.devSigningKey
  }}).beforeAndAfter();

  beforeEach(() => gkServer.reset());

  const aRequestWithSession = reqOptions.builder().withSession();
  const aUserGuid = userGuid(aRequestWithSession);
  const aMetasiteId = 'af4bcfdf-5eee-4b9e-84b8-eef6a6d06d35';
  const aPermission = {scope: 'aScope', action: 'anAction'};


  it('should provide working gatekeeper client', () => {
    gkServer.givenUserPermission(aUserGuid, aMetasiteId, aPermission);

    return authorizeAndExpect(testApp, 201);
  });

  function authorizeAndExpect(testApp, status) {
    const url = `/authorize?metasite=${aMetasiteId}&scope=${aPermission.scope}&action=${aPermission.action}`;
    return fetch(testApp.getUrl(url), aRequestWithSession.options())
      .then(res => expect(res.status).to.equal(status));
  }

  function userGuid(requestOpts) {
    return requestOpts.wixSession.session.userGuid
  }
});
