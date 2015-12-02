'use strict';
const rp = require('request-promise'),
  env = require('env-support').basic(),
  testkit = require('wix-childprocess-testkit');

describe('management app', () => {

  it('should use default mount point, port if none are provided via env', testkit.withinApp('./test/apps/defaults.js',
    {env: {PORT: env.PORT}}, testkit.checks.httpGet('/health/is_alive'), () =>
      rp('http://localhost:8084/health/deployment/test')
  ));

  it('should use default mount point, port if none are provided via env', testkit.withinApp('./test/apps/defaults.js',
    {env}, testkit.checks.httpGet('/health/is_alive'), () =>
      rp(`http://localhost:${env.MANAGEMENT_PORT}${env.MOUNT_POINT}/health/deployment/test`)
  ));
});