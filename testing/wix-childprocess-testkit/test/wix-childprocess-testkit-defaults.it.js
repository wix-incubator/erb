'use strict';
const chai = require('chai'),
  expect = chai.expect,
  testkit = require('..'),
  rp = require('request-promise'),
  envSupport = require('env-support');

chai.use(require('chai-as-promised'));

describe('wix-childprocess-testkit basics', function () {
  this.timeout(10000);

  describe('defaults', () => {
    const env = envSupport.basic();
    const server = testkit.server('test/apps/app-http', {env: env}, testkit.checks.httpGet('/test'));

    before(() => expect(rp(`http://localhost:${env.PORT}${env.MOUNT_POINT}/test`)).to.be.rejected);

    before(() => server.start());
    after(() => server.stop());

    it('should be running', () => rp(`http://localhost:${env.PORT}${env.MOUNT_POINT}/test`));

    after(() => expect(rp(`http://localhost:${env.PORT}${env.MOUNT_POINT}/test`)).to.be.rejected);
  });

  describe('uses wix-testkit-base', () => {
    const env = envSupport.basic();
    testkit.server('test/apps/app-http', {env: env}, testkit.checks.httpGet('/test')).beforeAndAfter();

    it('should be running', () => rp(`http://localhost:${env.PORT}${env.MOUNT_POINT}/test`));
  });

});
