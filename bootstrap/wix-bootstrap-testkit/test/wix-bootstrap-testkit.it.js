const testkit = require('..'),
  expect = require('chai').expect,
  http = require('wnp-http-test-client');

describe('bootstrap testkit', function () {
  this.timeout(30000);

  describe('testkit.server', () => {
    const app = testkit.server('./test/app').beforeAndAfter();

    it('runs server in forked process and with cluster', () => {
      return http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/info`).then(res => {
        expect(res.json().isWorker).to.equal(true);
        expect(res.json().pid).to.not.equal(process.pid);
      });
    });
  });

  describe('testkit.app', () => {
    const app = testkit.app('./test/app').beforeAndAfter();

    it('runs app in same process and without cluster', () => {
      return http.okGet(`http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}/info`).then(res => {
        expect(res.json().isWorker).to.equal(false);
        expect(res.json().pid).to.equal(process.pid);
      });
    });
  });
});
