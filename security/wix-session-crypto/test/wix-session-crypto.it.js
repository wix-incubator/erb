const expect = require('chai').expect,
  {WixSessionCrypto, devKey} = require('..'),
  jvmTestkit = require('wix-jvm-bootstrap-testkit'),
  http = require('wnp-http-test-client');

describe('wix session crypto it', function() {
  this.timeout(120000);

  const server = jvmTestkit.server({
    artifact: {
      groupId: 'com.wixpress.node',
      artifactId: 'wix-spjs-test-server',
      version: '1.0.0-SNAPSHOT'
    }
  }).beforeAndAfter();

  it('should decrypt and decode wixSession2', () => {
    const decrypt = token => new WixSessionCrypto(devKey).decrypt(token);

    return http.okGet(server.getUrl('/api/session')).then(res => {
      const sessionTokenFromResponse = res.json().tokens.wixSession2;
      const sessionFromResponse = res.json().session;

      assertEquals(sessionFromResponse, decrypt(sessionTokenFromResponse));
    });
  });

  function assertEquals(fromResponse, decoded) {
    expect(decoded.userGuid).to.equal(fromResponse.userGuid);
    expect(decoded.userName).to.equal(fromResponse.userName);
    expect(decoded.wixStaff).to.equal(fromResponse.isWixStaff);
    expect(decoded.userCreationDate.getTime()).to.equal(new Date(fromResponse.userCreationDate).getTime());
  }
});
