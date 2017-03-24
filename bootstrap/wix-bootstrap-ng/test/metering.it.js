const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  fetch = require('node-fetch'),
  statsdTestkit = require('wix-statsd-testkit'),
  eventually = require('wix-eventually');

describe('bootstrap - express metering', function() {
  this.timeout(10000);
  const envOverrides = {WIX_BOOT_STATSD_INTERVAL: 100, ENABLE_EXPRESS_METRICS: true};
  const app = testkit.app('metering', envOverrides).beforeAndAfter();
  const statsdServer = statsdTestkit.server().beforeAndAfterEach();

  it('reports metrics for route', () => {
    return fetch(app.appUrl('/my-route'))
      .then(() => eventually(() => {
        expect(statsdServer.events('tag=WEB.type=express.resource=get_my-route.samples')).not.to.be.empty;
      }));
  });
});
