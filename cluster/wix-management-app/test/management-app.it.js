'use strict';
const chai = require('chai'),
  expect = chai.expect,
  rp = require('request-promise'),
  envSupport = require('env-support'),
  testkit = require('wix-childprocess-testkit');

chai.use(require('chai-as-promised'));

describe('management app', () => {
  let testApp, env;

  beforeEach(() => env = envSupport.basic());
  afterEach(() => testApp.stop());

  describe('health/deployment/test', () => {

    it('should respond with 200 if at least 1 app responds to is_alive with "ok"', () =>
      withApp('./test/apps/defaults.js', testkit.checks.httpGet('/health/is_alive'))
        .then(() => rp(managementUrl('/health/deployment/test')))
    );

    it('should respond with 200 on /app-info if no app-info app is provided', () =>
      withApp('./test/apps/defaults.js', testkit.checks.httpGet('/health/is_alive'))
        .then(() => rp(managementUrl('/app-info')))
    );

    it('should respond with 500 if no worker processes are active', () =>
      withApp('./test/apps/no-workers.js', testkit.checks.stdOut('Management app listening'))
        .then(() => expect(rp(managementUrl('/health/deployment/test'))).to.be.rejectedWith('500'))
    );

    it('should respond with 500 and error payload if connected worker process responds with other than 200', () =>
      withApp('./test/apps/dead-worker.js', testkit.checks.stdOut('App listening'))
        .then(() => expect(rp(managementUrl('/health/deployment/test'))).to.be.rejectedWith('500 - {"name":"Error","message":"woops"}'))
    );

    it('should server app-info on /app-info given it is provided', () =>
      withApp('./test/apps/with-app-info.js', testkit.checks.httpGet('/health/is_alive'))
        .then(() => expect(rp(managementUrl('/app-info'))).to.eventually.equal('Hi there from app info'))
    );

    it('should server noop app-info given explicit app-info instance is not provided', () =>
      withApp('./test/apps/defaults.js', testkit.checks.httpGet('/health/is_alive'))
        .then(() => expect(rp(managementUrl('/app-info'))).to.eventually.equal(''))
    );
  });

  function managementUrl(path) {
    return `http://localhost:${env.MANAGEMENT_PORT}${env.MOUNT_POINT}${path || ''}`;
  }

  function appUrl(path) {
    return `http://localhost:${env.PORT}${env.MOUNT_POINT}${path || ''}`;
  }

  function withApp(app, check) {
    testApp = testkit.server(app, {env}, check);
    return testApp.start();
  }
});