'use strict';
const chai = require('chai'),
  should = chai.should(),
  rp = require('request-promise'),
  _ = require('lodash'),
  env = require('env-support').basic(),
  testkit = require('wix-childprocess-testkit');

chai.use(require('./support/matchers'));
chai.use(require('chai-as-promised'));

describe('management app', () => {

  describe('/', () => {
    it('should serve basic app info', testkit.withinApp('./test/apps/defaults.js', {env}, testkit.checks.httpGet('/health/is_alive'), () => {

      //TODO: this should be unit test? now I cannot test uptime and time
      return rp(managementUrl())
        .then(response => response.should.match({
          appName: env.APP_NAME,
          mountPoint: env.MOUNT_POINT,
          port: env.PORT.toString(),
          managementPort: env.MANAGEMENT_PORT.toString(),
          version: process.version
        }));
    }));
  });

  describe('health/deployment/test', () => {

    it('should respond with 200 if at least 1 app responds to is_alive with "ok"',
      testkit.withinApp('./test/apps/defaults.js', {env}, testkit.checks.httpGet('/health/is_alive'), () => {
        return rp(appUrl('/health/is_alive')).then(() => rp(managementUrl('/health/deployment/test')));
      }));

    it('should respond with 500 if no worker processes are active',
      testkit.withinApp('./test/apps/no-workers.js', {env}, testkit.checks.stdOut('Management app listening'), () => {
        return rp(appUrl('/health/is_alive')).should.be.rejectedWith('ECONNREFUSED')
          .then(() => rp(managementUrl('/health/deployment/test'))).should.be.rejectedWith('500');
      }));

    it('should respond with 500 if connected worker process responds with other than 200',
      testkit.withinApp('./test/apps/dead-worker.js', {env}, testkit.checks.stdOut('Management app listening'), () => {
        return rp(appUrl('/health/is_alive')).should.be.rejectedWith('500')
          .then(() => rp(managementUrl('/health/deployment/test'))).should.be.rejectedWith('500');
      }));
  });

  function managementUrl(path) {
    return `http://localhost:${env.MANAGEMENT_PORT}${env.MOUNT_POINT}${path || ''}`;
  }

  function appUrl(path) {
    return `http://localhost:${env.PORT}${env.MOUNT_POINT}${path || ''}`;
  }
});