const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  http = require('wnp-http-test-client');

describe('bootstrap runner', function () {
  this.timeout(10000);
  const app = testkit.app('default').beforeAndAfter();

  it('runs app via node cluster', () => {
    return http.okGet(app.appUrl('/is-worker')).then(res => {
      expect(res.json()).to.contain.property('isWorker', true);
    });
  });
});
