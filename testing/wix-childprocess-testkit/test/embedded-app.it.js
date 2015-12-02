'use strict';
const request = require('request'),
  chai = require('chai'),
  expect = chai.expect,
  testkit = require('..'),
  net = require('net'),
  _ = require('lodash'),
  rp = require('request-promise'),
  env = require('env-support').basic();

chai.use(require('chai-as-promised'));

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
        verifyNotListening(done);
      });
    });
  });

  describe('before and after', () => {
    testApp = anApp('app-http');

    before(done => verifyNotListening(done));

    testApp.beforeAndAfter();

    it('should start a service before test and shutdown afterwards', done => {
      aSuccessGet(done);
    });

    after(done => verifyNotListening(done));
  });


  describe('before and after each', () => {
    testApp = anApp('app-http');

    beforeEach(done => verifyNotListening(done));

    testApp.beforeAndAfterEach();

    it('should start a service before test and shutdown afterwards', done => {
      aSuccessGet(done);
    });

    afterEach(done => verifyNotListening(done));
  });

  describe('within app', () => {
    const context = {timeout: 1000, env};
    afterEach(done => verifyNotListening(done));

    it('start/stop server within test',
      testkit.withinApp('./test/apps/app-http.js', {env}, testkit.checks.httpGet('/test'), () => {
        return rp(`http://localhost:${env.PORT}${env.MOUNT_POINT}`)
          .then(res => expect(res).to.be.equal('Hello'));
      }));

    it('should catch failures if client app crashes', () => {
      return testkit.withinApp('./test/apps/app-throw.js', context, testkit.checks.httpGet('/test'), () => {
        })()
        .then(() => {
          chai.assert.notOk('test passed', 'test should not pass if the server crashes, not allowing for the http request to be performed');
        }, (error) => {
          expect(error.message).to.contain('Program exited with code: 1');
        });
    });
  });

  function verifyNotListening(done) {
    const cb = _.once(done);
    const client = net.Socket();

    client.on('error', () => cb());

    client.connect({port: env.PORT}, () => {
      client.end();
      cb(Error('expected connect failure, but could connect on port: ' + env.PORT));
    });
  }

  function anApp(app, timeout) {
    testApp = testkit.embeddedApp(`./test/apps/${app}.js`, {timeout, env: env}, testkit.checks.httpGet('/test'));
    return testApp;
  }

  function aSuccessGet(done) {
    request(`http://localhost:${env.PORT}${env.MOUNT_POINT}`, (error, response) => {
      expect(error).to.be.null;
      expect(response.statusCode).to.equal(200);
      done();
    });
  }
})
;
