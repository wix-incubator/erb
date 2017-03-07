const WixMeasured = require('wix-measured'),
  StatsD = require('node-statsd'),
  expect = require('chai').expect,
  testkit = require('wix-statsd-testkit'),
  WixStatsdAdapter = require('..'),
  eventually = require('wix-eventually').with({timeout: 5000});

describe('wix-measured-statsd-adapter', function () {
  this.timeout(10000);
  const server = testkit.server().beforeAndAfterEach();

  describe('gauge', () => {

    it('emits single event for a gauge metric with value and postfix with .gauge', () => {
      const measured = create(10).measured;
      measured.gauge('singleGauge')(() => 10);

      return eventually(() => {
        expect(server.events(withPrefix('gauge=singleGauge'))).to.not.be.empty;
        expect(server.events('singleGauge').pop().value).to.equal(10);
      });
    });
  });

  describe('meter', () => {

    it('emits meter with full key', () => {
      const measured = create(10).measured;
      measured.meter('deathRateMeter')(10);

      return eventually(() => {
        expect(server.events(withPrefix('meter=deathRateMeter'))).to.not.be.empty;
      });
    });

    it('emits samples, m1_rate events for a meter metric', () => {
      const measured = create(10).measured;
      measured.meter('deathRateMeterDetailed')(10);

      return eventually(() => {
        expect(server.events('deathRateMeterDetailed.samples').pop().value).to.equal(10);
        expect(server.events('deathRateMeterDetailed.m1_rate').pop().value).to.be.within(0, 10);
      });
    });
    
  });

  describe('hist', () => {

    it('emits hist with full key', () => {
      const measured = create(10).measured;
      measured.hist('deathRateHist')(10);

      return eventually(() => {
        expect(server.events(withPrefix('hist=deathRateHist'))).to.not.be.empty;
      });
    });

    it('emits max, p50, p95, p99, p999 events for a hist metric', () => {
      const measured = create(10).measured;
      measured.hist('deathRateHistDetailed')(10);

      return eventually(() => {
        expect(server.events('deathRateHistDetailed.max').pop().value).to.equal(10);
        expect(server.events('deathRateHistDetailed.p50').pop().value).to.be.within(0, 10);
        expect(server.events('deathRateHistDetailed.p95').pop().value).to.be.within(0, 10);
        expect(server.events('deathRateHistDetailed.p99').pop().value).to.be.within(0, 10);
        expect(server.events('deathRateHistDetailed.p999').pop().value).to.be.within(0, 10);
      });
    });

  });

  it('reports events according to supplied interval', done => {
    const measured = create(10).measured;

    measured.gauge('deathCountInterval')(() => 10);

    setTimeout(() => {
      expect(server.events('deathCountInterval').length).to.be.gt(50).and.to.be.lt(100);
      done();
    }, 1000);
  });

  it('stops reporting once stop() is invoked', done => {
    const bundle = create(10);

    bundle.measured.gauge('deathCountStop')(() => 10);
    bundle.adapter.stop();

    const count = server.events('deathCountStop');

    setTimeout(() => {
      expect(server.events('deathCountStop').length).to.be.gt(0);
      expect(server.events('deathCountStop').length).to.be.within(count, count + 2);
      done();
    }, 1000);
  });

  it('supports attaching to multiple wix-measured instances', () => {
    const measured1 = new WixMeasured('host1', 'app1');
    const measured2 = new WixMeasured('host2', 'app2');
    const adapter = new WixStatsdAdapter(new StatsD({host: 'localhost'}), {interval: 10});
    measured1.addReporter(adapter);
    measured2.addReporter(adapter);

    measured1.collection('id', '1').gauge('deathCount1')(() => 10);
    measured2.collection('id', '2').gauge('deathCount2')(() => 10);

    return eventually(() => {
      expect(server.events('id=1').length).to.be.above(0);
      expect(server.events('id=2').length).to.be.above(0);
    });
  });

  it('does not crash with uninitialized meters', done => {
    const bundle = create(10);
    bundle.measured.gauge('aGauge');
    bundle.measured.meter('aMeter');
    bundle.measured.hist('aHist');

    setTimeout(done, 100);
  });

  function create(interval) {
    const factory = new WixMeasured('localhost', 'my-app');

    const adapter = new WixStatsdAdapter(new StatsD({host: 'localhost'}), {interval});
    factory.addReporter(adapter);
    return {measured: factory.collection('key', 'value'), adapter};
  }

  function withPrefix(postfix) {
    return `root=node_app_info.host=localhost.app_name=my-app.key=value.${postfix}`;
  }
});
