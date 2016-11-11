const expect = require('chai').expect,
  gatekeeperClient = require('..'),
  rpcClient = require('wix-json-rpc-client'),
  httpTestkit = require('wix-http-testkit'),
  jvmTestkit = require('wix-jvm-bootstrap-testkit'),
  fetch = require('node-fetch'),
  reqOptions = require('wix-req-options'),
  rpcClientSupport = require('wix-rpc-client-support'),
  wixSessionAspect = require('wix-session-aspect'),
  wixExpressAspects = require('wix-express-aspects'),
  wixSessionCrypto = require('wix-session-crypto'),
  errors = require('wix-json-rpc-client').errors;

describe('wix-gatekeeper-client it', function () {
  this.timeout(60000);
  const server = gatekeeperRpcTestServer();
  const appServer = testAppServer();

  const dispatcherRequestOpts = aRequestWithSession();
  const aUserId = userGuid(dispatcherRequestOpts);
  const aMetasiteId = 'ba919184-cf8d-40a2-9ad6-6fe14f636cde';
  const aPermission = {scope: 'aScope', action: 'anAction'};

  beforeEach(() => resetGatekeeperRpcTestServer());

  describe('authorize', () => {
    it('return nothing if user is authorized', () => {
      return givenUserPermissions(aUserId, aMetasiteId, aPermission)
        .then(() => requestAuthorization(dispatcherRequestOpts, aMetasiteId, aPermission))
        .then(expectAuthorizationStatus(200))
        .then(expectEmptyAuthorizationResponse)
    });

    it('should fail with GatekeeperAccessDenied when user is not authorized', () => {
      return requestAuthorization(dispatcherRequestOpts, aMetasiteId, aPermission)
        .then(expectAuthorizationStatus(401))
    });

    it('should fail with RpcRequestError when rpc server isn\'t available', () => {
      const wrongPort = server.getPort() + 7;
      return requestAuthorization(dispatcherRequestOpts, aMetasiteId, aPermission, wrongPort)
        .then(expectAuthorizationStatus(422))
    });

  });

  function gatekeeperRpcTestServer() {
    return jvmTestkit.server({
      artifact: {
        groupId: 'com.wixpress.node',
        artifactId: 'wix-test-gatekeeper-server',
        version: '1.0.0-SNAPSHOT'
      }
    }).beforeAndAfter();
  }

  function testAppServer() {
    const appServer = httpTestkit.server().beforeAndAfter();
    const app = appServer.getApp();
    app.use(wixExpressAspects.get([
      wixSessionAspect.builder(
        token => wixSessionCrypto.v1.get(wixSessionCrypto.v1.devKey).decrypt(token),
        token => wixSessionCrypto.v2.get(wixSessionCrypto.v2.devKey).decrypt(token))]));

    app.get('/authorize', (req, res) => {
      const rpcFactory = rpcClient.factory();
      rpcClientSupport.get({rpcSigningKey: rpcClientSupport.devSigningKey}).addTo(rpcFactory);

      const gkClient = gatekeeperClient.factory(rpcFactory, `http://localhost:${req.query.port}`)
        .client(req.aspects);

      gkClient
        .authorize(req.query.metasiteId, {scope: req.query.scope, action: req.query.action})
        .then(authResp => res.send(!!authResp).end())
        .catch((e) => {
          if (e instanceof errors.RpcRequestError) {
            res.status(422).end();
          } else if (e instanceof gatekeeperClient.errors.GatekeeperAccessDenied) {
            res.status(401).end();
          } else {
            res.status(500).end();
          }
        });
    });
    return appServer;
  }

  function givenUserPermissions(userId, metasiteId, permission) {
    const body = {
      userId: userId,
      metasiteId: metasiteId,
      permissions: [permission]
    };
    return fetch(
      server.getUrl('/api/gatekeeper/set-permissions'),
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
      }
    ).then((res) => {
      expect(res.status).to.equal(200);
      return res;
    });
  }

  function aRequestWithSession() {
    return reqOptions.builder().withSession();
  }

  function userGuid(session) {
    return session.wixSession.session.userGuid
  }

  function requestAuthorization(dispatcherRequestOpts, metasiteId, permission, port) {
    const thePort = port || server.getPort();
    return fetch(
      appServer.getUrl(
        `/authorize?metasiteId=${metasiteId}&scope=${permission.scope}&action=${permission.action}&port=${thePort}`
      ),
      dispatcherRequestOpts.options()
    )
  }

  function expectAuthorizationStatus(status) {
    return res => {
      expect(res.status).to.equal(status);
      return res;
    }
  }

  function expectEmptyAuthorizationResponse(res) {
    return res.text()
      .then(text => expect(text).to.equal('false'))
      .then(() => res);
  }

  function resetGatekeeperRpcTestServer() {
    return fetch(
      server.getUrl('/api/gatekeeper/reset'),
      {
        method: 'POST'
      }
    ).then((res) => {
      expect(res.status).to.equal(200);
      return res;
    });
  }

});

