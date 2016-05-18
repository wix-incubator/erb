'use strict';
const _ = require('lodash'),
  expect = require('chai').expect,
  testkit = require('..'),
  env = require('env-support').basic();

describe('checks', function () {
  this.timeout(10000);
  const ctx = {env};

  describe('HttpCheck', () => {
    testkit
      .server('./test/apps/app-checks-http', {env}, testkit.checks.httpGet('/test'))
      .beforeAndAfterEach();

    const resCheck = (err, res) => (_.isNull(err) && (res && res.statusCode >= 200 && res.statusCode < 300));

    it('should callback failure() when check fails', done => {
      const check = testkit.checks.http({method: 'get', uri: 'http://127.0.0.1:123'}, resCheck);

      check.invoke(ctx, expectToNotBeCalled(done), expectToBeCalled(done));
    });

    it('should callback success() when check passes', done => {
      const check = testkit.checks.http({method: 'get', uri: `http://localhost:${env.PORT}${env.MOUNT_POINT}`}, resCheck);

      check.invoke(ctx, expectToBeCalled(done), expectToNotBeCalled(done));
    });
  });

  describe('HttpGetCheck', () => {
    testkit
      .server('./test/apps/app-checks-http', {env}, testkit.checks.httpGet('/test'))
      .beforeAndAfterEach();

    it('should fail for 404 response', done => {
      testkit.checks
        .httpGet('/qweqwe')
        .invoke(ctx, expectToNotBeCalled(done), expectToBeCalled(done));
    });

    it('should fail for 500 response', done => {
      testkit.checks
        .httpGet('/500')
        .invoke(ctx, expectToNotBeCalled(done), expectToBeCalled(done));
    });

    it('should pass for 200 response', done => {
      testkit.checks
        .httpGet('/')
        .invoke(ctx, expectToBeCalled(done), expectToNotBeCalled(done));
    });

    it('should pass for 2xx response', done => {
      testkit.checks
        .httpGet('/201')
        .invoke(ctx, expectToBeCalled(done), expectToNotBeCalled(done));
    });
  });

  describe('StdErrCheck', () => {
    it('should pass if stderr contains string', done => {
      testkit.checks
        .stdErr('found')
        .invoke({stderr: () => ['', 'found']}, expectToBeCalled(done), expectToNotBeCalled(done));
    });

    it('should fail if stderr does not contain string', done => {
      testkit.checks
        .stdErr('zz')
        .invoke({stderr: () => ['', 'found']}, expectToNotBeCalled(done), expectToBeCalled(done));
    });
  });

  describe('StdOutCheck', () => {
    it('should pass if stdout contains string', done => {
      testkit.checks
        .stdOut('found')
        .invoke({stdout: () => ['', 'found']}, expectToBeCalled(done), expectToNotBeCalled(done));
    });

    it('should fail if stdout does not contain string', done => {
      testkit.checks
        .stdOut('zz')
        .invoke({stdout: () => ['', 'found']}, expectToNotBeCalled(done), expectToBeCalled(done));
    });
  });

  function expectToBeCalled(done) {
    return () => {
      expect(true).to.be.ok;
      done();
    };
  }

  function expectToNotBeCalled(done) {
    return () => {
      expect(false).to.be.ok;
      done();
    };
  }
});
