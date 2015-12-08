'use strict';
const chai = require('chai'),
  rp = require('request-promise'),
  expect = chai.expect,
  chaiAsPromised = require('chai-as-promised'),
  testkit = require('wix-childprocess-testkit'),
  env = require('env-support').basic();

chai.use(chaiAsPromised);

describe('wix express timeout', function () {
  this.timeout(30000);

  const app = testkit.embeddedApp('./test/apps/launcher.js', {env}, testkit.checks.httpGet('/'));

  app.beforeAndAfter();

  it('should allow normal operations', () =>
    aGet('/ok').then(res => expect(res.statusCode).to.equal(200))
  );

  it('should emit x-timeout event on response in case of timeout operation', () =>
    aGet('/slow').then(res => {
      expect(res.statusCode).to.equal(504);
      expect(res.body).to.be.equal('timeout: request timed out after 10 mSec');
    })
  );

  it('should not timeout when overriding the timeout and the first times out assuming the second did not time out (allowing to set override timeout for specific operations)', () =>
    aGet('/slower/but-fine').then(response => {
      expect(response.statusCode).to.equal(200);
    })
  );

  it('should timeout if the second middle does timeout in case of timeout override', () =>
    aGet('/slower/not-fine').then(res => {
      expect(res.statusCode).to.be.equal(504);
      expect(res.body).to.be.equal('timeout: request timed out after 100 mSec');
    })
  );

  function aGet(path) {
    return rp({
      uri: `http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}${path}`,
      resolveWithFullResponse: true,
      simple: false
    });
  }

});