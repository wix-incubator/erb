'use strict';
const expect = require('chai').expect,
  req = require('./support/req'),
  testkit = require('wix-childprocess-testkit'),
  envSupport = require('env-support');

describe.skip('bootstrap shutdown hooks', function () {
  this.timeout(60000);
  const env = envSupport.basic();
  const app = testkit
    .server('it/apps/shutdown-hooks/index', {env}, testkit.checks.httpGet('/health/is_alive'))
    .beforeAndAfter();

  it('should call a registered shutdown function on worker process termination', () =>
    req.get(`http://localhost:${env.PORT}${env.MOUNT_POINT}/die`).then(res => {
      expect(res.status).to.equal(500);
      return eventually(() => expect(app.stdout().join('')).to.be.string('shutdown hook was called'));
    })
  );
});

//TODO: extract it somewhere else
function eventually(fn) {
  let timeout = 5000;
  const iterationTimeout = 100;

  return new Promise((resolve, reject) => {
    let poller = () => {
      try {
        fn();
        resolve();
      } catch (e) {
        if (timeout < 0) {
          reject(e);
        } else {
          timeout -= iterationTimeout;
          setTimeout(poller, iterationTimeout);
        }
      }
    };

    poller();
  });
}