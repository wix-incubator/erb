const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  http = require('wnp-http-test-client'),
  sessionTestkit = require('wix-session-crypto-testkit').v2;

describe('wnp bootstrap context', function () {
  this.timeout(10000);

  const app = testkit.server('context', {
    PORT: 3000,
    MANAGEMENT_PORT: 3004,
    MOUNT_POINT: '/context',
    APP_LOG_DIR: './target/logs',
    APP_TEMPL_DIR: './templates',
    APP_CONF_DIR: './test/apps/context/configs',
    HOSTNAME: 'some-host'
  }).beforeAndAfter();

  it('should provided preconfigured config(wix-config) instance within context', () => {
    return http.okGet(app.appUrl('/config/test-config')).then(res => 
      expect(res.json()).to.deep.equal({aKey: 'aValue'}));
  });

  it('should expose port, managementPort, mountPoint, logDir via context.env', () => {
    http.okGet(app.appUrl('/env')).then(res => {
      expect(res.json()).to.contain.property('PORT', '3000');
      expect(res.json()).to.contain.property('MANAGEMENT_PORT', '3004');
      expect(res.json()).to.contain.property('APP_LOG_DIR', './target/logs');
    });
  });

  it('should expose name, version via context.app', () => {
    http.okGet(app.appUrl('/app')).then(res => {
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
});
