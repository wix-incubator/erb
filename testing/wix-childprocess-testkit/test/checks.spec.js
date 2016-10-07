'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  testkit = require('..'),
  env = require('env-support').basic();

describe('checks', function () {
  this.timeout(10000);
  const ctx = {env};

  testkit
    .fork('./test/apps/app-checks-http', {env}, testkit.checks.httpGet('/test'))
    .beforeAndAfter();

  describe('HttpCheck', () => {
    it('should return failed promise when check fails', () =>
      expect(testkit.checks.http('http://127.0.0.1:123')(ctx)).to.eventually.be.rejected);

    it('should resolve to success check passes', () =>
      expect(testkit.checks.http(`http://localhost:${env.PORT}${env.MOUNT_POINT}`)(ctx)).to.eventually.be.fulfilled);
  });

  describe('HttpGetCheck', () => {

    it('should fail for 404 response', () =>
      expect(testkit.checks.httpGet('/qweqwe')(ctx)).to.eventually.be.rejected);

    it('should fail for 500 response', () =>
      expect(testkit.checks.httpGet('/500')(ctx)).to.eventually.be.rejected);

    it('should pass for 200 response', () =>
      expect(testkit.checks.httpGet('/')(ctx)).to.eventually.be.fulfilled);

    it('should pass for 2xx response', () =>
      expect(testkit.checks.httpGet('/201')(ctx)).to.eventually.be.fulfilled);
  });

  describe('StdOutErrCheck', () => {
    it('should pass if output contains string', () =>
      expect(testkit.checks.stdErrOut('found')({output: 'found'})).to.eventually.be.fulfilled);

    it('should fail if output does not contain string', () =>
      expect(testkit.checks.stdErrOut('zz')({output: 'found'})).to.eventually.be.rejected);
  });
});
