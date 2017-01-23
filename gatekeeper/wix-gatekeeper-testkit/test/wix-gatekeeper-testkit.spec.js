const expect = require('chai').use(require('chai-as-promised')).expect,
  rpcClient = require('wix-json-rpc-client'),
  rpcClientSupport = require('wix-rpc-client-support'),
  gkTestkit = require('..'),
  gkClient = require('wix-gatekeeper-client'),
  aspects = require('wix-aspects'),
  sessionAspect = require('wix-session-aspect'),
  sessionTestkit = require('wix-session-crypto-testkit'),
  sessionCrypto = require('wix-session-crypto');

describe('wix-gatekeeper-testkit', () => {
  const server = gkTestkit.server().beforeAndAfter();

  const aUserGuid = 'fa6723c6-56b2-4343-af41-a565bcc74828';
  const aMetasiteId = '464fbd3a-72b7-4122-b8b5-93a0f151a07a';
  const aPermission = {scope: 'aScope', action: 'anAction'};

  beforeEach(() => server.reset());

  it('should use default port 3029 when no port specified', () => {
    expect(server.getPort()).to.equal(3029);
  });

  it('should use specified port', () => {
    const nonDefaultServer = gkTestkit.server({port: 3333});
    expect(nonDefaultServer.getPort()).to.equal(3333);
  });

  describe('authorize', () => {
    it('should reject with GatekeeperAccessDenied if user is not authorized', () => {
      return expect(client(aUserGuid).authorize(aMetasiteId, aPermission))
        .to.eventually.be.rejectedWith(gkClient.errors.GatekeeperAccessDenied);
    });

    it('should resolve with empty result', () => {
      server.givenUserPermission(aUserGuid, aMetasiteId, aPermission);

      return expect(client(aUserGuid).authorize(aMetasiteId, aPermission))
        .to.eventually.be.fulfilled.and.undefined;
    });

    it('should reject permission using a custom handler', () => {
      server.givenUserPermissionHandler(() => false);
      return expect(client(aUserGuid).authorize(aMetasiteId, aPermission))
        .to.eventually.be.rejectedWith(gkClient.errors.GatekeeperAccessDenied);
    });

    it('should resolve permission using a custom handler', () => {
      server.givenUserPermissionHandler(() => true);
      return expect(client(aUserGuid).authorize(aMetasiteId, aPermission))
        .to.eventually.be.fulfilled.and.undefined;
    });
  });

  function client(userGuid) {
    const rpcFactory = rpcClient.factory();
    rpcClientSupport.get({rpcSigningKey: rpcClientSupport.devSigningKey}).addTo(rpcFactory);
    return gkClient
      .factory(rpcFactory, `http://localhost:${server.getPort()}`)
      .client(givenAspectStore(userGuid));
  }

  //TODO: extract to aspects testkit
  function givenAspectStore(userGuid) {
    const session = sessionTestkit.aValidBundle({ session: { userGuid } });
    const storeIn = { cookies: {}};
    storeIn.cookies[session.cookieName] = session.token;

    return aspects.buildStore(storeIn, [sessionAspect.builder(
        token => sessionCrypto.v1.get(sessionCrypto.v1.devKey).decrypt(token),
        token => sessionCrypto.v2.get(sessionCrypto.v2.devKey).decrypt(token)
      )]
    );
  }
});
