const expect = require('chai').use(require('chai-as-promised')).expect,
  testkit = require('..'),
  fetch = require('node-fetch'),
  envSupport = require('env-support');

describe('wix-childprocess-testkit basics', function () {
  this.timeout(10000);

  describe('defaults', () => {
    const env = envSupport.basic();
    const server = testkit.fork('test/apps/app-http', {env: env}, testkit.checks.httpGet('/test'));

    before('not listening', () =>
      expect(fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/test`)).to.eventually.be.rejected);
    before('start', () => server.start());

    it('should be running', () => fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/test`));

    after(() => server.stop());
    after('not listening', () => expect(fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/test`)).to.eventually.be.rejected);
  });

  describe('uses wix-testkit-base', () => {
    const env = envSupport.basic();
    testkit.fork('test/apps/app-http', {env: env}, testkit.checks.httpGet('/test')).beforeAndAfter();

    it('should be running', () => fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/test`));
  });

});
