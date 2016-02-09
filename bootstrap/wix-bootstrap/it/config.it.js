'use strict';
const expect = require('chai').expect,
  req = require('./support/req'),
  testkit = require('wix-childprocess-testkit'),
  env = require('env-support').basic();

describe('wix bootstrap config', function () {
  this.timeout(60000);

  const app = testkit.server('it/apps/custom-config/index', {env: env}, testkit.checks.httpGet('/health/is_alive'));
  app.beforeAndAfter();

  it('passes over cluster config (worker process count set to 1) to wix-cluster module', () =>
    req.get(`http://localhost:${env.MANAGEMENT_PORT}${env.MOUNT_POINT}/app-info`).then(res => {
      expect(res.status).to.equal(200);
      expect(res.json()).to.contain.deep.property('processCount', 2);
    })
  );
});