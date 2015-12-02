'use strict';
const request = require('request'),
  chai = require('chai'),
  expect = chai.expect,
  testkit = require('wix-childprocess-testkit'),
  env = require('env-support').basic();


//TODO: test configuraiton, logging
describe('wix bootstrap cluster', function () {
  this.timeout(30000);

  describe('simple app', () => {
    testkit.embeddedApp('test/apps/basic/index.js', {env}, testkit.checks.httpGet('/')).beforeAndAfter();

    it('should start app on port and mount point defined by env', done => {
      request(`http://localhost:${env.PORT}${env.MOUNT_POINT}`, (error, response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('app with separate config.js', () => {
    testkit.embeddedApp('test/apps/with-config-js/index.js', {env}, testkit.checks.httpGet('/')).beforeAndAfter();

    it('should start app on port and mount point defined by env', done => {
      request(`http://localhost:${env.PORT}${env.MOUNT_POINT}`, (error, response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });
});