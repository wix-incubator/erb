const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  http = require('wnp-http-test-client'),
  sessionTestkit = require('wix-session-crypto-testkit').v2,
  statsdTestkit = require('wix-statsd-testkit'),
  eventually = require('wix-eventually');

describe('wnp bootstrap context', function () {
  this.timeout(10000);
  
  const app = testkit.server('context', {
    PORT: 3000,
    MANAGEMENT_PORT: 3004,
    MOUNT_POINT: '/context',
    APP_LOG_DIR: './target/logs',
    APP_TEMPL_DIR: './templates',
    APP_CONF_DIR: './test/apps/context/configs',
    HOSTNAME: 'some-host',
    'WIX_BOOT_STATSD_INTERVAL': 50
  }).beforeAndAfter();

  it('should provided preconfigured config(wix-config) instance within context', () => {
    return http.okGet(app.appUrl('/config/test-config')).then(res => 
      expect(res.json()).to.deep.equal({aKey: 'aValue'}));
  });

  it('should expose port, managementPort, mountPoint, logDir via context.env', () => {
    return http.okGet(app.appUrl('/env')).then(res => {
      expect(res.json()).to.contain.property('PORT', '3000');
      expect(res.json()).to.contain.property('MANAGEMENT_PORT', '3004');
      expect(res.json()).to.contain.property('APP_LOG_DIR', './target/logs');
    });
  });

  it('should expose name, version via context.app', () => {
    return http.okGet(app.appUrl('/app')).then(res => {
      expect(res.json()).to.contain.deep.property('name', 'wnp-bootstrap-composer');
      expect(res.json()).to.contain.deep.property('version');
    });
  });

  it('should provided preconfigured newrelic instance within context', () => {
    return http.okGet(app.appUrl('/newrelic')).then(res =>
      expect(res.json()).to.deep.equal({reqTimingHeaders: '', appTimingHeaders: ''}));
  });
  
  it('should provide preconfigured session via context.session', () => {
    const bundle = sessionTestkit.aValidBundle();

    return http.okGet(app.appUrl(`/session?token=${bundle.token}`)).then(res => 
      expect(res.json()).to.deep.equal(bundle.sessionJson));
  });
  
  describe('metrics', () => {
    const statsd = statsdTestkit.server().beforeAndAfter();
    
    it('should add metrics.factory that is configured to publish to statsd', () => {
      return http.okPost(app.appUrl('/factory-meter?collectionName=aName&collectionValue=aValue&key=aKey'))
        .then(() => eventually(() => expect(statsd.events('aName=aValue.meter=aKey.count')).to.not.be.empty));
    });

    it('should add metrics.client that has tag METER set and is configured to publish to statsd', () => {
      return http.okPost(app.appUrl('/client-meter?key=aKey'))
        .then(() => eventually(() => expect(statsd.events('tag=METER.meter=aKey.count')).to.not.be.empty));
    });
    
    //TODO: enable once wix-cluster is bundled-in with composer
    it.skip('should configure cluster master to publish to statsd', () => {
      return eventually(() => expect(statsd.events('class=master-process')).to.not.be.empty);
    });

    it.skip('should stop statsd publisher on app stop', () => {
      //TODO: figure out how to test-it, maybe have a bucket test for all built-in stops.
    });
  });
});
