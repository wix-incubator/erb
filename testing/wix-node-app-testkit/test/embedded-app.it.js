'use strict';
const request = require('request'),
  expect = require('chai').expect,
  testkit = require('..');

const env = {
  PORT: 3000,
  MOUNT_POINT: '/app'
};

describe('embedded app', function () {
  this.timeout(10000);
  let testApp;

  describe('startup', () => {

    afterEach(done => testApp.stop(done));

    it('should start/stop embedded app with http get availability check', done => {
      anApp('app-http').start(() => aSuccessGet(done));
    });

    it('should respect provided timeout', done => {
      anApp('app-timeout-2000', 1000).start(err => {
        expect(err).to.be.instanceof(Error);
        done();
      });
    });

    it('should timeout within 4 seconds by default', done => {
      anApp('app-timeout-5000').start(err => {
        expect(err).to.be.instanceof(Error);
        done();
      });
    });

    it('should expose stdout/stderr', done => {
      anApp('app-log').start(() => {
        expect(testApp.stderr().pop()).to.contain('error log');
        expect(testApp.stdout().pop()).to.contain('info log');
        done();
      });
    });
  });

  describe('cleanup on failure', () => {

    it('should emit callback with error if embedded app fails', done => {
      anApp('app-throw').start(err => {
        expect(err).to.be.instanceof(Error);
        done();
      });
    });

  });

  describe('before and after', () => {
    testApp = anApp('app-http');

    before(done => anConnRefusedGet(done));

    testApp.beforeAndAfter();

    it('should start a service before test and shutdown afterwards', done => {
      aSuccessGet(done);
    });

    after(done => anConnRefusedGet(done));
  });


  describe('before and after each', () => {
    testApp = anApp('app-http');

    beforeEach(done => anConnRefusedGet(done));

    testApp.beforeAndAfterEach();

    it('should start a service before test and shutdown afterwards', done => {
      aSuccessGet(done);
    });

    afterEach(done => anConnRefusedGet(done));
  });


  function anApp(app, timeout) {
    testApp = testkit.embeddedApp(`./test/apps/${app}.js`, {timeout, env}, testkit.checks.httpGet('/test'));
    return testApp;
  }

  function aSuccessGet(done) {
    request('http://localhost:3000/app', (error, response) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
  }

  function anConnRefusedGet(done) {
    request('http://localhost:3000/app', error => {
      expect(error).to.be.instanceof(Error);
      expect(error.message).to.contain('ECONNREFUSED');
      done();
    });
  }
});
