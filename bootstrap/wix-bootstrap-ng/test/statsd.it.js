const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  eventually = require('wix-eventually'),
  statsdTestkit = require('wix-statsd-testkit'),
  http = require('wnp-http-test-client');

describe('wix bootstrap statsd', function () {
  this.timeout(20000);

  const statsd = statsdTestkit.server().beforeAndAfterEach();

  const app = testkit.app('statsd', {
    APP_CONF_DIR: './test/apps/context/configs',
    WIX_BOOT_STATSD_INTERVAL: 100
  }).beforeAndAfter();

  it('starts and activates statsd reporting from cluster', () => {
    return eventually(() => expect(statsd.events('class=master-process')).to.not.be.empty);
  });

  it('sends metrics reported via app to statsd', () => {
    return http.okPost(app.appUrl('/meter?key=aKey'))
      .then(() => eventually(() => expect(statsd.events('meter=aKey.samples')).to.not.be.empty));
  });
});
