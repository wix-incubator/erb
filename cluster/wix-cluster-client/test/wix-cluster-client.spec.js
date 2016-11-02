'use strict';
const expect = require('chai').expect,
  client = require('..'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch'),
  eventually = require('wix-eventually').with({timeout: 5000});

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
        .then(() => eventually(() =>
          fetch('http://localhost:3000/stats')
            .then(res => res.json())
            .then(json => expect(json.deathCount).to.equal(1)))
        )
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
        .then(() => eventually(() => {
          expect(app.output).to.be.string('worker-1 received event aKey with value aValue');
          expect(app.output).to.be.string('worker-2 received event aKey with value aValue');
        }))
    );

    it('should publish stats set-up message to master process', () => {
      const req = {
        interval: 2000,
        host: 'statsd-host'
      };
      return fetch('http://localhost:3000/emit-statsd', {
        method: 'POST',
        body: JSON.stringify(req),
        headers: {'Content-Type': 'application/json'}
      })
        .then(res => expect(res.status).to.equal(200))
        .then(() => eventually(() => {
          return fetch('http://localhost:3004/on-statsd')
            .then(res => res.json())
            .then(json => {
              expect(json).to.deep.equal(req);
            });
        }))
    })
  });

  describe('stats', () => {
    const emit = msg => () => client().configureStatsD(msg);

    it('should fail for incomplete stats configuration message', () => {
      expect(emit()).to.throw('opts is mandatory');
      expect(emit({host: 'local'})).to.throw('opts.interval is mandatory');
      expect(emit({interval: 123})).to.throw('opts.host is mandatory');
    });

    it('should pass-through a correct message', () => {
      emit({
        interval: 2000,
        host: 'statsd-host'
      });
    });
  });
});

function retryingIt(name, cb) {
  it(name, () => eventually(cb));
}
