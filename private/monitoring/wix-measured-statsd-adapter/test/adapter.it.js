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
        'root=node_app_info.host=localhost.app_name=my-app.gauge=deathCount',
        value => expect(value).to.equal(10));
    });
  });

  it('emits count, m1_rate events for a meter metric', () => {
    const measured = create(200).measured;

    measured.meter('deathRate', 10);

    return eventually(() => {
      assertEvent(
        server.events('deathRate.count').pop(),
        'root=node_app_info.host=localhost.app_name=my-app.meter=deathRate.count',
        value => expect(value).to.equal(10));

      assertEvent(
        server.events('deathRate.m1_rate').pop(),
        'root=node_app_info.host=localhost.app_name=my-app.meter=deathRate.m1_rate',
        value => expect(value).to.be.within(0, 10));
    });
  });

  it('emits samples, p50, p95 events for a histogram metric', () => {
    const measured = create(200).measured;

    measured.hist('deathRate', 10);

    return eventually(() => {

      assertEvent(
        server.events('deathRate.samples').pop(),
        'root=node_app_info.host=localhost.app_name=my-app.hist=deathRate.samples',
        value => expect(value).to.equal(1));
      
      assertEvent(
        server.events('deathRate.p50').pop(),
        'root=node_app_info.host=localhost.app_name=my-app.hist=deathRate.p50',
        value => expect(value).to.be.within(0, 10));

      assertEvent(
        server.events('deathRate.p95').pop(),
        'root=node_app_info.host=localhost.app_name=my-app.hist=deathRate.p95',
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
    const measured1 = new WixMeasured('host1', 'app1');
    const measured2 = new WixMeasured('host2', 'app2');
    const adapter = new WixStatsdAdapter(new StatsD({host: 'localhost'}), {interval: 200});
    measured1.addReporter(adapter);
    measured2.addReporter(adapter);

    measured1.collection('id=1').gauge('deathCount', () => 10);
    measured2.collection('id=2').gauge('deathCount', () => 10);

    return eventually(() => {
      expect(server.events('id=1').length).to.be.above(0);
      expect(server.events('id=2').length).to.be.above(0);
    });
  });


  function create(interval) {
    const measured = new WixMeasured('localhost', 'my-app');
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
