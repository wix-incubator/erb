'use strict';
const expect = require('chai').expect,
  client = require('..'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch'),
  retry = require('retry-as-promised');

describe('wix-cluster-client', function () {

  describe('non-clustered', () => {

    it('should return process count as 1', () => {
      expect(client().workerCount).to.equal(1);
    });

    it('should return death count as "N/A"', () => {
      expect(client().deathCount).to.equal('N/A');
    });

    it('should return memory stats for a process', () => {
      const instance = client();
      const stats = instance.stats;
      expect(stats).to.contain.property('rss').that.is.gt(0);
      expect(stats).to.contain.property('heapTotal').that.is.gt(0);
      expect(stats).to.contain.property('heapUsed').that.is.gt(0);

      const stats2 = instance.stats;

      expect(stats).to.not.deep.equal(stats2);
    });
  });

  describe('clustered', () => {
    testkit
      .server('./test/app/wix-cluster-app', {env: {PORT: 3000}}, testkit.checks.httpGet('/'))
      .beforeAndAfter();

    retryingIt('should return worker count', () =>
      fetch('http://localhost:3000/stats')
        .then(res => res.json())
        .then(json => expect(json.workerCount).to.equal(2))
    );

    retryingIt('should return death count', () =>
      fetch('http://localhost:3000/die')
        .then(() => fetch('http://localhost:3000/stats'))
        .then(res => res.json())
        .then(json => expect(json.deathCount).to.equal(1))
    );

    retryingIt('should return stats', () =>
      fetch('http://localhost:3000/stats')
        .then(res => res.json())
        .then(json => {
          const stats = json.stats;
          expect(stats).to.contain.property('rss').that.is.gt(0);
          expect(stats).to.contain.property('heapTotal').that.is.gt(0);
          expect(stats).to.contain.property('heapUsed').that.is.gt(0);
        })
    );
  });

  function retryingIt(name, cb) {
    it(name, () => retry(cb, 3));
  }

});