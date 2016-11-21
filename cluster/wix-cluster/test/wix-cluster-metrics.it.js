'use strict';
const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  statsdTestkit = require('wix-statsd-testkit'),
  eventually = require('wix-eventually'),
  fetch = require('node-fetch');

describe('wix cluster metrics', function () {
  this.timeout(30000);
  const statsd = statsdTestkit.server().beforeAndAfterEach();
  testkit.server('cluster-stats').beforeAndAfterEach();

  it('should report master and worker stats upon activation from worker', () => {
    return eventually(() => {
      expect(statsd.events('process=master.gauge=memory')).to.not.be.empty;
      expect(statsd.events('process=worker.gauge=memory')).to.not.be.empty;

      expect(statsd.events('process=master.meter=fork.count').pop().value).to.equal(1);
    });
  });

  it('should report fork/death stats', () => {
    return fetch('http://localhost:3000/die').then(() => eventually(() => {
      expect(statsd.events('process=master.meter=fork.count').pop().value).to.equal(2);
      expect(statsd.events('process=master.meter=exit.count').pop().value).to.equal(1);
    }));
  });
});
