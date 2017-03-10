const testkit = require('./support/testkit'),
  http = require('wnp-http-test-client'),
  retry = require('retry-promise').default,
  expect = require('chai').expect;

describe('wnp bootstrap errors', function () {
  this.timeout(20000);

  const app = testkit.app('default').beforeAndAfter();

  it('should kill worker process on uncaught exception', () => {
    let deathCountBefore = 0;
    return captureDeathCountBeforeTo(deathCount => deathCountBefore = deathCount)
      .then(() => http(app.appUrl('/die')))
      .then(assertResponse500)
      .then(assertDeathCountPlusOne(deathCountBefore));
  });

  function captureDeathCountBeforeTo(setDeathCount) {
    return getAppInfoData().then(setDeathCount);
  }

  function getAppInfoData() {
    return http.okGet(app.managementAppUrl('/app-info/about/api', {timeout: 1000}), http.accept.json)
      .then(res => res.json().workerDeathCount);
  }

  function assertResponse500(res) {
    expect(res.status).to.equal(500);
  }

  function assertDeathCountPlusOne(deathCountBefore) {
    return () => retry(() => {
      return getAppInfoData()
        .then(deathCount => expect(deathCount).to.equal(deathCountBefore + 1));
    })
  }
});
