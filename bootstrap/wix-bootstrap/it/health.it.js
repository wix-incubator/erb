'use strict';
const expect = require('chai').expect,
  env = require('./support/environment'),
  async = require('async'),
  req = require('./support/req');

describe('wix bootstrap health', function () {
  this.timeout(60000);
  env.start();

  it('should start app on port and mount point defined by env', () =>
    req.get(env.appUrl('/')).then(res =>
      expect(res.status).to.equal(200)
    ));

  it('should expose "/health/is_alive"', () =>
    req.get(env.appUrl('/health/is_alive')).then(res => {
      expect(res.headers._headers['cache-control']).to.be.undefined;
      expect(res.status).to.equal(200);
      expect(res.text).to.equal('Alive');
    }));

  it('should serve management apps "/health/deployment/test"', () =>
    req.get(env.managementAppUrl('/health/deployment/test')).then(res => {
      expect(res.status).to.equal(200);
      expect(res.text).to.equal('Test passed');
    }));

  it('multiple "/health/deployment/test"', done =>
  {
    async.times(10, (n, next) => {
      req.get(env.managementAppUrl('/health/deployment/test')).then(res => {
        expect(res.status).to.equal(200);
        expect(res.text).to.equal('Test passed');
        next(null, true)
      })
    }, done);
  });
});