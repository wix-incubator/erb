const jvmTestkit = require('wix-jvm-bootstrap-testkit'),
  rpcClient = require('wix-json-rpc-client'),
  rpcClientSupport = require('wix-rpc-client-support'),
  SessionRenewer = require('../lib/session-renewer'),
  {aValidBundle} = require('wix-session-crypto-testkit'),
  expect = require('chai').expect,
  axios = require('axios');

describe('SessionRenewer', function() {
  
  this.timeout(60000);

  const server = jvmTestkit.server({
    artifact: {
      groupId: 'com.wixpress.node',
      artifactId: 'wix-spjs-test-server',
      version: '1.0.1-SNAPSHOT'
    }
  }).beforeAndAfter();

  beforeEach(() => resetTestkit());
  
  describe('validate', () => {
    
    it('handles rejection', () => {
      const bundle = aValidBundle();

      return sessionRenewer().validate(bundle.sessionRaw)
        .then(res => expect(res.valid).to.be.false);
    });
    
    it('handles success', () => {
      const bundle = aValidBundle();
      const cookie = {key: 'cookie-name', value: 'cookie-value', httpOnly: false, expirySeconds: 666}; 
      return authorize(bundle.session.userGuid, [cookie])
        .then(() => sessionRenewer().validate(bundle.sessionRaw))
        .then(res => {
          expect(res.valid).to.be.true;
          expect(res.cookies).to.deep.include(cookie);
        });
    });
  });

  function authorize(userGuid, cookies) {
    const cookiesFragment = cookies.map(cookie => `new CookieDef('${cookie.key}', '${cookie.value}', ${cookie.httpOnly}, ${cookie.expirySeconds})`).join();
    const script = `
      var renewer = beanByType('com.wixpress.node.rpc.FakeRemoteRenewalSessionValidationService');
      var CookieDef = Java.type('com.wixpress.framework.security.users.api.RemoteRenewalSessionValidationService.CookieDef');
      renewer.authorize('${userGuid}', [${cookiesFragment}]);`;
    return execute(script);
  }
  
  function sessionRenewer() {
    const factory = rpcClient.factory();
    rpcClientSupport.get({rpcSigningKey: rpcClientSupport.devSigningKey}).addTo(factory);
    return new SessionRenewer(factory.clientFactory(server.getUrl(), 'RemoteRenewalSessionValidationService'));
  }

  function resetTestkit() {
    const script = `
      var renewer = beanByType('com.wixpress.node.rpc.FakeRemoteRenewalSessionValidationService');
      renewer.reset();`;
    return execute(script);
  }

  function execute(script) {
    return axios.post(server.getUrl('/js/execute'), script, {headers: {'content-type': 'text/plain'}})
      .then(res => {
        expect(res.status).to.equal(200);
        return res.data;
      });
  }
});
