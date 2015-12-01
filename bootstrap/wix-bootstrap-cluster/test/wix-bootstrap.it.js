'use strict';
const request = require('request'),
  chai = require('chai'),
  expect = chai.expect,
  testkit = require('wix-childprocess-testkit');

const port = testkit.env.randomPort();
const env = {
  PORT: port,
  APP_NAME: 'my-app',
  MOUNT_POINT: '/my-app',
  MANAGEMENT_PORT: port + 4
};

//TODO: test configuraiton, logging
describe('wix bootstrap cluster', function () {
  this.timeout(30000);

  describe('simple app', () => {
    testkit.embeddedApp('test/apps/basic/index.js', {timeout: 8000, env}, testkit.checks.httpGet('/')).beforeAndAfter();

    it('should start app on port and mount point defined by env', done => {
      request(`http://localhost:${port}/my-app/`, (error, response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('app with separate config.js', () => {
    testkit.embeddedApp('test/apps/with-config-js/index.js', {timeout: 8000, env}, testkit.checks.httpGet('/')).beforeAndAfter();

    it('should start app on port and mount point defined by env', done => {
      request(`http://localhost:${port}/my-app/`, (error, response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });
});