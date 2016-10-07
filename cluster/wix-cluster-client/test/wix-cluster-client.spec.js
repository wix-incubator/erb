'use strict';
const expect = require('chai').expect,
  client = require('..'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch'),
  retry = require('retry-as-promised');

describe('wix-cluster-client', function () {
  this.timeout(10000);

  describe('non-clustered', () => {

    it('should return workerId as 1', () => {
      expect(client().workerId).to.equal(1);
    });


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

    it('should allow to emit and consume messages', done => {
      const instance = client();

      instance.on('messageKey', msg => {
        expect(msg).to.deep.equal({value: 'aValue'});
        done();
      });

      instance.emit('messageKey', {value: 'aValue'});
    });
  });

  describe('clustered', () => {
    const app = testkit.fork('./test/app/wix-cluster-app', {env: {PORT: 3000}}, testkit.checks.httpGet('/'))
      .beforeAndAfterEach();

    it('should return workerId that matches worker.id', () =>
      fetch('http://localhost:3000/id')
        .then(res => res.json())
        .then(json => expect(json.id).to.equal(json.workerId))
    );


    retryingIt('should return worker count', () =>
      fetch('http://localhost:3000/stats')
        .then(res => res.json())
        .then(json => expect(json.workerCount).to.equal(2))
    );

    it('should return death count', () =>
      fetch('http://localhost:3000/die')
        .then(() => retry(() =>
            fetch('http://localhost:3000/stats')
              .then(res => res.json())
              .then(json => expect(json.deathCount).to.equal(1))
          , 3))
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

    it('should broadcast message to all workers', () =>
      fetch('http://localhost:3000/emit/aValue')
        .then(res => expect(res.status).to.equal(200))
        .then(() => retry(() => Promise.resolve().then(() => {
          expect(app.output).to.be.string('worker-1 received event aKey with value aValue');
          expect(app.output).to.be.string('worker-2 received event aKey with value aValue');
        }), 3))
    );
  });
});

function retryingIt(name, cb) {
  it(name, () => retry(cb, 3));
}
