'use strict';
const WixMeasured = require('wix-measured'),
  StatsD = require('node-statsd'),
  expect = require('chai').expect,
  testkit = require('wix-statsd-testkit'),
  WixStatsdAdapter = require('..'),
  eventually = require('wix-eventually').with({timeout: 5000});

describe('wix-measured-statsd-adapter', function () {
  this.timeout(10000);
  const server = testkit.server().beforeAndAfterEach();

  it('emits single gauge event for a gauge metric', () => {
    const measured = create(200).measured;

    measured.gauge('deathCount', () => 10);

    return eventually(() => {
      assertEvent(
        server.events('deathCount').pop(),
        'app_name=my-app.host=localhost.gauge=deathCount',
        value => expect(value).to.equal(10));
    });
  });

  it('emits count, m1_rate events for a meter metric', () => {
    const measured = create(200).measured;

    measured.meter('deathRate', 10);

    return eventually(() => {
      assertEvent(
        server.events('deathRate.count').pop(),
        'app_name=my-app.host=localhost.meter=deathRate.count',
        value => expect(value).to.equal(10));

      assertEvent(
        server.events('deathRate.m1_rate').pop(),
        'app_name=my-app.host=localhost.meter=deathRate.m1_rate',
        value => expect(value).to.be.within(0, 10));
    });
  });

  it('emits median, p75, p95, p99 events for a histogram metric', () => {
    const measured = create(200).measured;

    measured.hist('deathRate', 10);

    return eventually(() => {
      assertEvent(
        server.events('deathRate.median').pop(),
        'app_name=my-app.host=localhost.hist=deathRate.median',
        value => expect(value).to.be.within(0, 10));

      assertEvent(
        server.events('deathRate.p75').pop(),
        'app_name=my-app.host=localhost.hist=deathRate.p75',
        value => expect(value).to.be.within(0, 10));

      assertEvent(
        server.events('deathRate.p95').pop(),
        'app_name=my-app.host=localhost.hist=deathRate.p95',
        value => expect(value).to.be.within(0, 10));

      assertEvent(
        server.events('deathRate.p99').pop(),
        'app_name=my-app.host=localhost.hist=deathRate.p99',
        value => expect(value).to.be.within(0, 10));
    });
  });

  it('reports events according to supplied interval', done => {
    const measured = create(200).measured;

    measured.gauge('deathCount', () => 10);

    setTimeout(() => {
      expect(server.events('deathCount').length).to.be.gt(2).and.to.be.lt(10);
      done();
    }, 1000);
  });

  it('stops reporting once stop() is invoked', () => {
    const bundle = create(200);

    bundle.measured.gauge('deathCount', () => 10);
    bundle.adapter.stop();

    const count = server.events('deathCount');

    setTimeout(() => {
      expect(server.events('deathCount')).to.be.within(count, count + 2);
    }, 1000);
  });

  it('supports attaching to multiple wix-measured instances', () => {
    const measured1 = new WixMeasured({id: '1'});
    const measured2 = new WixMeasured({id: '2'});
    const adapter = new WixStatsdAdapter(new StatsD({host: 'localhost'}), {interval: 200});
    measured1.addReporter(adapter);
    measured2.addReporter(adapter);

    measured1.gauge('deathCount', () => 10);
    measured2.gauge('deathCount', () => 10);

    return eventually(() => {
      expect(server.events('id=1').length).to.be.above(0);
      expect(server.events('id=2').length).to.be.above(0);
    });
  });


  function create(interval) {
    const measured = new WixMeasured({
      app_name: 'my-app',
      host: 'localhost'
    });
    const adapter = new WixStatsdAdapter(new StatsD({host: 'localhost'}), {interval});
    measured.addReporter(adapter);
    return {measured, adapter};
  }

  function assertEvent(event, name, valueMatcher) {
    expect(event.key).to.equal(name);
    if (valueMatcher) {
      valueMatcher(event.value);
    }
  }
});