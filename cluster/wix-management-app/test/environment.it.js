'use strict';
const rp = require('request-promise'),
  env = require('env-support').basic(),
  testkit = require('wix-childprocess-testkit');

describe.only('management app', () => {
  let testApp;

  afterEach(() => testApp.stop());


  it('should use default mount point, port if none are provided via env', () =>
    withApp('./test/apps/defaults.js', {PORT: env.PORT})
      .then(() => rp('http://localhost:8084/health/deployment/test'))
  );

  it('should use default mount point, port if none are provided via env', () =>
    withApp('./test/apps/defaults.js', env)
      .then(() => rp(`http://localhost:${env.MANAGEMENT_PORT}${env.MOUNT_POINT}/health/deployment/test`))
  );

  function withApp(app, env) {
    testApp = testkit.embeddedApp(app, {env}, testkit.checks.httpGet('/health/is_alive'));
    return testApp.start();
  }
});