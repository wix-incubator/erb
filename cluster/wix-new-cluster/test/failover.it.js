'use strict';
const testkit = require('./support/testkit'),
  stats = require('./support/stats'),
  expect = require('chai').expect,
  eventually = require('wix-eventually');

describe('wix cluster failover', function () {
  this.timeout(60000);
  const app = testkit.server('delayed-startup').beforeAndAfterEach();

  it('should restart worker failing with uncaughtException', () => {
    return app.post('/die')
      .then(() => stats.assertDisconnectCountEquals(1))
      .then(() => stats.assertWorkerCountEquals(1))
      .then(() => app.okGet('/'));
  });

  it('should restart exiting worker', () => {
    return app.post('/exit')
      .then(() => stats.assertDisconnectCountEquals(1))
      .then(() => stats.assertWorkerCountEquals(1))
      .then(() => eventually(() => app.okGet('/')));
  });


  it('should not drop connections during worker restarts', done => {
    const failedResponses = [];
    const deaths = setInterval(() =>
        app.post('/die').catch(() => failedResponses.push(false)),
      1000);

    const gets = setInterval(() => {
      Promise.all([
        app.okGet('/random-delay').catch(() => failedResponses.push(false)),
        app.okGet('/random-delay').catch(() => failedResponses.push(false)),
        app.okGet('/random-delay').catch(() => failedResponses.push(false))]);
    }, 500);

    setTimeout(() => {
      clearInterval(deaths);
      clearInterval(gets);

      Promise.resolve()
        .then(() => expect(failedResponses.length).to.equal(0))
        .then(() => stats.getDisconnectCount(app).then(count => expect(count).to.be.gt(0)))
        .then(() => stats.getPeakWorkerCount(app).then(count => expect(count).to.be.lt(3)))
        .then(() => done())
        .catch(err => done(err));
    }, 10000);
  });
});
