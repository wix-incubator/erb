'use strict';
var rp = require('request-promise'),
  expect = require('chai').expect,
  _ = require('lodash'),
  testkit = require('wix-childprocess-testkit');

describe('wix cluster events', function () {
  this.timeout(30000);
  testkit.server('./test/apps/defaults', {env: {PORT: 3000, MANAGEMENT_PORT: 8084}}, testkit.checks.httpGet('/'))
    .beforeAndAfter();

  it.skip('should publish events on worker memory usage', () => {
    return rp('http://localhost:8084/stats').then(res => {
      expect(_.filter(JSON.parse(res), {type: 'stats'}).length).to.equal(2);
    });
  });

  it('should publish active worker count', () =>
    rp('http://localhost:3000/stats').then(res => expect(JSON.parse(res).workerCount).to.equal(2))
  );

  it('should publish worker death count', () =>
    rp('http://localhost:3000/stats')
      .then(res => expect(JSON.parse(res).deathCount).to.equal(0))
      .then(() => rp('http://localhost:3000/die'))
      .then(() => delay(1000))
      .then(() => rp('http://localhost:3000/stats'))
      .then(res => expect(JSON.parse(res).deathCount).to.equal(1))
  );

  it('should publish memory stats', () =>
    rp('http://localhost:3000/stats').then(res => expect(JSON.parse(res).stats.rss).to.be.gt(0))
  );

  it('should publish memory stats periodically', () => {
    const stats = [];
    return rp('http://localhost:3000/stats')
      .then(res => stats.push(JSON.parse(res).stats))
      .then(() => delay(1500))
      .then(() => rp('http://localhost:3000/stats'))
      .then(res => stats.push(JSON.parse(res).stats))
      .then(() => {
        const fromSecondPush = stats.pop();
        const fromFirstPush = stats.pop();
        expect(fromSecondPush).to.not.deep.equal(fromFirstPush);
      });
  });


  function delay(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
  }
});