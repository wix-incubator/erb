'use strict';
const http = require('wnp-http-test-client'),
  testkit = require('./support/testkit'),
  assert = require('./support/asserts'),
  eventually = require('./support/eventually'),
  expect = require('chai').expect;

describe('wix cluster failover', function () {
  this.timeout(60000);

  describe('failing worker restart', () => {
    const app = testkit.server('defaults').beforeAndAfter();

    it('should restart failing worker', () => {
      return http.okGet(app.getUrl('/die'))
        .then(() => eventually(() => assert.disconnectCount(app, 1)))
        .then(() => eventually(() => assert.workerCount(app, 1)))
        .then(() => http.okGet(app.getUrl('/')));
    });
  });

  describe('graceful restart', () => {
    const app = testkit.server('delayed-startup').beforeAndAfter();

    it('should not drop connections during worker restarts', done => {
      const failedResponses = [];
      const deaths = setInterval(() => {
        http.okGet(app.getUrl('/die'))
          .catch(() => failedResponses.push(false));
      }, 1000);

      const gets = setInterval(() => {
        Promise.all([http.okGet(app.getUrl('/random-delay')), http.okGet(app.getUrl('/random-delay')), http.okGet(app.getUrl('/random-delay'))])
          .catch(() => failedResponses.push(false));
      }, 500);

      setTimeout(() => {
        clearInterval(deaths);
        clearInterval(gets);

        Promise.resolve()
          .then(() => expect(failedResponses.length).to.equal(0))
          .then(() => assert.getDisconnectCount(app).then(count => expect(count).to.be.gt(0)))
          .then(() => assert.getPeakWorkerCount(app).then(count => expect(count).to.be.lt(3)))
          .then(() => done())
          .catch(err => done(err));
      }, 10000);

    });

  });

});