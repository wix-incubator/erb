const testkit = require('./support/testkit'),
  http = require('wnp-http-test-client'),
  Promise = require('bluebird'),
  expect = require('chai').expect;

describe('wnp bootstrap', function () {
  this.timeout(10000);
  testkit.app('default', {PORT: 3010, MANAGEMENT_PORT: 3014, MOUNT_POINT: '/app'}).beforeAndAfter();

  it('should listen on PORT/MOUNT_POINT as a main app', () => {
    return http.okGet('http://localhost:3010/app/health/is_alive');
  });


  it('should listen on MANAGEMENT_PORT/MOUNT_POINT as a management app', () => {
    return http.okGet('http://localhost:3014/app/health/deployment/test');
  });

  describe('options', () => {
    const app = testkit.app('options-health', {DELAY_OVERRIDE: 100}).beforeAndAfter();

    it('should allow to override health test delay', () => {
      return Promise.delay(500)
        .then(() => http.okGet(app.appUrl('/health-test-invocations')))
        .then(res => expect(res.json().count).to.be.gt(4));
    });
  });
});
