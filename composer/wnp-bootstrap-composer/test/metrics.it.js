const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  http = require('wnp-http-test-client'),
  statsdTestkit = require('wix-statsd-testkit'),
  eventually = require('wix-eventually');

describe('wnp bootstrap metrics', function () {
  this.timeout(10000);
  const statsd = statsdTestkit.server().beforeAndAfter();

  describe('metrics client', () => {
    const app = testkit.server('metrics', {
      HOSTNAME: 'some-host',
      'WIX_BOOT_STATSD_INTERVAL': 50
    }).beforeAndAfter();

    it('should add metrics.factory that is configured to publish to statsd', () => {
      return http.okPost(app.appUrl('/factory-meter?collectionName=aName&collectionValue=aValue&key=aKey'))
        .then(() => eventually(() => expect(statsd.events('aName=aValue.meter=aKey.samples')).to.not.be.empty));
    });

    it('should add metrics.client that has tag METER set and is configured to publish to statsd', () => {
      return http.okPost(app.appUrl('/client-meter?key=aKey'))
        .then(() => eventually(() => expect(statsd.events('tag=METER.meter=aKey.samples')).to.not.be.empty));
    });
  });

  describe('metrics shutdown', () => {
    const app = testkit.server('metrics', {
      HOSTNAME: 'some-host',
      'WIX_BOOT_STATSD_INTERVAL': 30000
    });

    after(() => app.stop().catch(() => Promise.resolve()));

    it('should flush collected metrics on app stop', () => {
      return app.start()
        .then(() => expect(statsd.events('aName=metrics-shutdown')).to.be.empty)
        .then(() => http.okPost(app.appUrl('/factory-meter?collectionName=aName&collectionValue=metrics-shutdown&key=aKey')))
        .then(() => app.stop())
        .then(() => eventually(() => expect(statsd.events('aName=metrics-shutdown')).to.not.be.empty));
    });
  });

});
