'use strict';
const expect = require('chai').expect,
  req = require('./support/req'),
  testkit = require('wix-childprocess-testkit'),
  env = require('env-support').basic();

describe('wix bootstrap with express app that returns a promise', function () {
  this.timeout(60000);

  testkit.server('it/apps/promisified-init/index.js', {env: env}, testkit.checks.httpGet('/health/is_alive'))
    .beforeAndAfter();

  it('should await with app start-up until promise is resolved', () =>
    req.get(`http://localhost:${env.PORT}${env.MOUNT_POINT}/initialized`).then(res => {
      expect(res.status).to.equal(200);
      expect(res.text).to.be.string('true');
    })
  );
});