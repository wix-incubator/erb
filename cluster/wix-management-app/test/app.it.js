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
  let testApp;

  afterEach(() => testApp.stop());

  describe('/', () => {
    it('should serve basic app info', () =>
      withApp('./test/apps/defaults.js', testkit.checks.httpGet('/health/is_alive'))
        .then(() => rp(managementUrl()))
        .then(response => response.should.match({
          appName: env.APP_NAME,
          mountPoint: env.MOUNT_POINT,
          port: env.PORT.toString(),
          managementPort: env.MANAGEMENT_PORT.toString(),
          version: process.version
        }))
    );
  });

  describe('health/deployment/test', () => {

    it('should respond with 200 if at least 1 app responds to is_alive with "ok"', () =>
      withApp('./test/apps/defaults.js', testkit.checks.httpGet('/health/is_alive'))
        .then(() => rp(appUrl('/health/is_alive')))
        .then(() => rp(managementUrl('/health/deployment/test')))
    );

    it('should respond with 500 if no worker processes are active', () =>
      withApp('./test/apps/no-workers.js', testkit.checks.stdOut('Management app listening'))
        .then(() => rp(appUrl('/health/is_alive'))).should.be.rejectedWith('ECONNREFUSED')
        .then(() => rp(managementUrl('/health/deployment/test'))).should.be.rejectedWith('500')
    );

    it('should respond with 500 if connected worker process responds with other than 200', () =>
      withApp('./test/apps/dead-worker.js', testkit.checks.stdOut('Management app listening'))
        .then(() => rp(appUrl('/health/is_alive'))).should.be.rejectedWith('500')
        .then(() => rp(managementUrl('/health/deployment/test'))).should.be.rejectedWith('500')
    );
  });

  function managementUrl(path) {
    return `http://localhost:${env.MANAGEMENT_PORT}${env.MOUNT_POINT}${path || ''}`;
  }

  function appUrl(path) {
    return `http://localhost:${env.PORT}${env.MOUNT_POINT}${path || ''}`;
  }

  function withApp(app, check) {
    testApp = testkit.embeddedApp(app, {env}, check);
    return testApp.start();
  }
});