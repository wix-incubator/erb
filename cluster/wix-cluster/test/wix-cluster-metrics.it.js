const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  statsdTestkit = require('wix-statsd-testkit'),
  eventually = require('wix-eventually');

describe('wix cluster metrics', function () {
  this.timeout(30000);
  const statsd = statsdTestkit.server().beforeAndAfterEach();
  const app = testkit.server('cluster-stats').beforeAndAfterEach();

  it('should report master and worker stats upon activation from worker', () => {
    return eventually(() => {
      expect(statsd.events('tag=INFRA.class=master-process.memory=rss-mb')).to.not.be.empty;
      expect(statsd.events('class=worker-process.memory=rss-mb')).to.not.be.empty;

      expect(statsd.events('class=master-process.process=fork.samples').pop().value).to.equal(1);
    });
  });

  it('should report fork/death stats', () => {
    return app.post('/die').then(() => eventually(() => {
      expect(statsd.events('class=master-process.process=fork.samples').pop().value).to.equal(2);
      expect(statsd.events('class=master-process.process=exit.samples').pop().value).to.equal(1);
    }));
  });
});
